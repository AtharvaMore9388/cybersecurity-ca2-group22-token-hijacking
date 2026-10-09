#!/usr/bin/env python3
"""
Synthetic token-replay / session-hijack detection simulator
Group 22 - Cyber Security CA-2 (Unit 4 case study)

Purpose
-------
Compare how different post-authentication controls behave against four
token-abuse scenarios that mirror what public reports describe for
Midnight Blizzard / APT29. All data is SYNTHETIC. Nothing here measures a real
Microsoft, AWS or Google product; it only shows how each control TYPE behaves
under the assumptions listed in Params.

Run:  python3 token_replay_sim.py          (writes results.json, results_sens.json)
"""
import json
from dataclasses import dataclass, asdict
import numpy as np

COUNTRIES = ["IN", "US", "GB", "DE", "SG", "AU", "JP", "BR"]
COUNTRY_W = [0.45, 0.20, 0.10, 0.07, 0.06, 0.05, 0.04, 0.03]
HQ = "IN"                          # corporate VPN egress country
CLOUDS = ["azure", "aws", "gcp"]
CLOUD_W = [0.60, 0.25, 0.15]

# risk-score weights (layer L4)
W = dict(asn_mismatch=0.20, unknown_asn=0.20, ua_mismatch=0.20,
         unusual_client=0.25, burst=0.25, new_app=0.40, country_mismatch=0.15)
THRESHOLD = 0.60

LAYERS = ["L0", "L1", "L2c", "L2a", "L3", "L4s", "L4m", "LAY"]
LAYER_NAMES = {
    "L0": "MFA at sign-in only",
    "L1": "Sign-in-time Conditional Access (country)",
    "L2c": "CAE, strict location (country)",
    "L2a": "CAE, strict location (IP/ASN list)",
    "L3": "Token binding (device-bound)",
    "L4s": "Risk analytics, single-cloud logs",
    "L4m": "Risk analytics, multi-cloud logs",
    "LAY": "Layered: L1 + L2c + L3 + L4m",
}
SCENARIOS = ["S1", "S2", "S3", "S4"]
SCENARIO_NAMES = {
    "S1": "Replay from foreign hosting",
    "S2": "Replay via residential proxy",
    "S3": "OAuth app-only mailbox abuse",
    "S4": "Cross-cloud pivot",
}


@dataclass
class Params:
    n_users: int = 1000
    sessions_per_user: int = 3
    attack_sessions_per_scenario: int = 100
    events_legit: int = 40          # mean token uses per legit session
    events_attack: int = 25         # mean attacker requests per attack session
    p_mobile: float = 0.06          # legit: switch to mobile ASN (same country)
    p_vpn: float = 0.15             # legit: event goes via corporate VPN (for VPN users)
    vpn_user_share: float = 0.30
    p_other_wifi: float = 0.01      # legit: unfamiliar Wi-Fi (new ASN, same country)
    p_travel: float = 0.03          # legit: whole session abroad
    p_ua_update: float = 0.01
    p_client_legit: float = 0.02
    p_burst_legit: float = 0.01
    coverage: float = 0.70          # share of victim sessions that are device-bound
    p_refresh: float = 0.80         # attacker triggers a sign-in-time evaluation
    p_same_asn: float = 0.50        # residential proxy sits on victim's own ISP
    seeds: int = 30


def pick(rs, items, w=None):
    return items[rs.choice(len(items), p=w)]


def make_user(rs, P):
    home = pick(rs, COUNTRIES, COUNTRY_W)
    vpn = rs.rand() < P.vpn_user_share
    u = dict(home=home, home_asn=f"{home}-ISP{rs.randint(0, 6)}",
             mobile_asn=f"{home}-MOB{rs.randint(0, 3)}", vpn=vpn)
    u["allowed_countries"] = {home} | ({HQ} if vpn else set())
    u["allowed_asn"] = {u["home_asn"], u["mobile_asn"]} | ({"CORPVPN"} if vpn else set())
    return u


def ev(country, asn, cloud, **kw):
    e = dict(country=country, asn=asn, cloud=cloud, ua=False, client=False,
             burst=False, new_app=False, app_only=False)
    e.update(kw)
    return e


def legit_session(u, rs, P):
    travel = rs.rand() < P.p_travel
    if travel:
        country = pick(rs, [c for c in COUNTRIES if c != u["home"]])
        asn = f"{country}-HOTEL{rs.randint(0, 30)}"
    else:
        country, asn = u["home"], u["home_asn"]
    n = max(5, rs.poisson(P.events_legit))
    events = []
    for _ in range(n):
        c, a = country, asn
        r = rs.rand()
        if r < P.p_mobile:
            a = f"{country}-MOB{rs.randint(0, 3)}" if travel else u["mobile_asn"]
        elif u["vpn"] and rs.rand() < P.p_vpn:
            c, a = HQ, "CORPVPN"
        elif rs.rand() < P.p_other_wifi:
            a = f"{c}-WIFI{rs.randint(0, 500)}"
        events.append(ev(c, a, pick(rs, CLOUDS, CLOUD_W),
                         ua=rs.rand() < P.p_ua_update,
                         client=rs.rand() < P.p_client_legit,
                         burst=rs.rand() < P.p_burst_legit))
    return dict(origin=(country, asn), events=events, bound=rs.rand() < P.coverage,
                kind="legit")


def attack_session(scn, u, rs, P):
    n = max(3, rs.poisson(P.events_attack))
    home = u["home"]
    bound = rs.rand() < P.coverage
    events = []
    if scn == "S1":
        fc = pick(rs, [c for c in COUNTRIES if c not in u["allowed_countries"]])
        asn = f"{fc}-HOST{rs.randint(0, 5)}"
        for _ in range(n):
            events.append(ev(fc, asn, pick(rs, CLOUDS, [0.8, 0.1, 0.1]),
                             ua=rs.rand() < 0.85, client=rs.rand() < 0.7,
                             burst=rs.rand() < 0.5))
    elif scn in ("S2", "S4"):
        same = rs.rand() < P.p_same_asn
        k = n if scn == "S2" else max(1, int(0.4 * n))
        for _ in range(k):
            a = u["home_asn"] if same else f"{home}-RES{rs.randint(0, 2000)}"
            events.append(ev(home, a, "azure" if rs.rand() < 0.9 else "aws",
                             ua=rs.rand() < 0.10, client=rs.rand() < 0.7,
                             burst=rs.rand() < 0.5))
        if scn == "S4":
            vc = pick(rs, [c for c in COUNTRIES if c != home])
            va = f"{vc}-VPS{rs.randint(0, 5)}"
            for _ in range(n - k):
                events.append(ev(vc, va, pick(rs, ["aws", "gcp"]),
                                 ua=rs.rand() < 0.5, client=rs.rand() < 0.7,
                                 burst=rs.rand() < 0.4))
    elif scn == "S3":
        cc = home if rs.rand() < 0.7 else pick(rs, COUNTRIES)
        asn = f"{cc}-CLOUDHOST{rs.randint(0, 5)}"
        for _ in range(n):
            events.append(ev(cc, asn, "azure", client=rs.rand() < 0.9,
                             burst=rs.rand() < 0.9, new_app=True, app_only=True))
    origin = None if scn == "S3" else (home, u["home_asn"])
    return dict(origin=origin, events=events, bound=bound, kind=scn)


# ---------------------------------------------------------------- scoring
def risk_score(e, s, u):
    known = set(u["allowed_asn"])
    if s["origin"]:
        known.add(s["origin"][1])
    score = 0.0
    if s["origin"] and e["asn"] != s["origin"][1]:
        score += W["asn_mismatch"]
    if e["asn"] not in known:
        score += W["unknown_asn"]
    score += W["ua_mismatch"] * e["ua"] + W["unusual_client"] * e["client"]
    score += W["burst"] * e["burst"] + W["new_app"] * e["new_app"]
    if s["origin"] and e["country"] != s["origin"][0] and e["asn"] != "CORPVPN":
        score += W["country_mismatch"]
    elif s["origin"] and e["asn"] == "CORPVPN" and HQ != s["origin"][0]:
        score += W["country_mismatch"]
    return score


def first_block(layer, s, u, rs, P):
    """index of the first event stopped by `layer`, or None."""
    evs, attack = s["events"], s["kind"] != "legit"
    if layer == "L0":
        return None
    if layer == "L1":
        # evaluated only when a sign-in / token refresh happens
        if attack and (s["kind"] == "S3" or rs.rand() > P.p_refresh):
            return None
        return 0 if evs[0]["country"] not in u["allowed_countries"] else None
    if layer in ("L2c", "L2a"):
        for i, e in enumerate(evs):
            if e["cloud"] != "azure" or e["app_only"]:
                continue                      # CAE only covers supported Microsoft resources
            if layer == "L2c" and e["country"] not in u["allowed_countries"]:
                return i
            if layer == "L2a" and e["asn"] not in u["allowed_asn"]:
                return i
        return None
    if layer == "L3":
        if attack and s["kind"] != "S3" and s["bound"]:
            return 0                           # replayed token has no device key proof
        return None
    if layer in ("L4s", "L4m"):
        for i, e in enumerate(evs):
            if layer == "L4s" and e["cloud"] != "azure":
                continue
            if risk_score(e, s, u) >= THRESHOLD - 1e-9:
                return i
        return None
    if layer == "LAY":
        hits = [first_block(l, s, u, rs, P) for l in ("L1", "L2c", "L3", "L4m")]
        hits = [h for h in hits if h is not None]
        return min(hits) if hits else None
    raise ValueError(layer)


def run_once(P, seed):
    rs = np.random.RandomState(seed)
    users = [make_user(rs, P) for _ in range(P.n_users)]
    out = {}
    # legit sessions
    legit = [(u, legit_session(u, rs, P)) for u in users for _ in range(P.sessions_per_user)]
    for l in LAYERS:
        fp = sum(first_block(l, s, u, rs, P) is not None for u, s in legit)
        out[(l, "FP")] = fp / len(legit)
    # attack sessions
    for scn in SCENARIOS:
        victims = [users[rs.randint(P.n_users)] for _ in range(P.attack_sessions_per_scenario)]
        sess = [(u, attack_session(scn, u, rs, P)) for u in victims]
        for l in LAYERS:
            det, expo = 0, []
            for u, s in sess:
                b = first_block(l, s, u, rs, P)
                n = len(s["events"])
                det += b is not None
                expo.append(n if b is None else b)
            out[(l, scn, "det")] = det / len(sess)
            out[(l, scn, "exp")] = float(np.mean(expo))
    return out


def aggregate(P):
    runs = [run_once(P, 1000 + i) for i in range(P.seeds)]
    keys = runs[0].keys()
    return {"|".join(k): (float(np.mean([r[k] for r in runs])),
                          float(np.std([r[k] for r in runs]))) for k in keys}


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Token replay detection simulator (synthetic data)")
    ap.add_argument("--quick", action="store_true", help="5 seeds, skip sensitivity runs (about 10 seconds)")
    ap.add_argument("--out", default=".", help="folder for results.json / results_sens.json")
    args = ap.parse_args()
    import os
    os.makedirs(args.out, exist_ok=True)

    base = Params(seeds=5) if args.quick else Params()
    res = aggregate(base)
    json.dump(dict(params=asdict(base), weights=W, threshold=THRESHOLD, results=res),
              open(os.path.join(args.out, "results.json"), "w"), indent=1)

    if not args.quick:
        sens = {"coverage": {}, "p_same_asn": {}}
        for c in (0.3, 0.5, 0.7, 0.9):
            sens["coverage"][str(c)] = aggregate(Params(coverage=c, seeds=10))
        for q in (0.0, 0.25, 0.5, 0.75, 1.0):
            sens["p_same_asn"][str(q)] = aggregate(Params(p_same_asn=q, seeds=10))
        json.dump(sens, open(os.path.join(args.out, "results_sens.json"), "w"), indent=1)

    print(f"{'layer':5s} {'FP%':>6s} | " + " ".join(f"{s:>6s}" for s in SCENARIOS))
    for l in LAYERS:
        row = " ".join(f"{100*res[f'{l}|{s}|det'][0]:6.1f}" for s in SCENARIOS)
        print(f"{l:5s} {100*res[f'{l}|FP'][0]:6.1f} | {row}")
