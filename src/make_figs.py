import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
from matplotlib.colors import LinearSegmentedColormap

plt.rcParams["font.family"] = "Liberation Serif"
plt.rcParams["font.size"] = 10
BLUE, DBLUE, LBLUE, BLACK = "#1F4FB0", "#0A2A6B", "#CFE0F8", "#000000"

R = json.load(open("results.json"))["results"]
S = json.load(open("results_sens.json"))
LAYERS = ["L0", "L1", "L2c", "L2a", "L3", "L4s", "L4m", "LAY"]
NAMES = {"L0": "L0  MFA at sign-in only",
         "L1": "L1  Sign-in-time CA (country)",
         "L2c": "L2c CAE strict location (country)",
         "L2a": "L2a CAE strict location (IP/ASN)",
         "L3": "L3  Device-bound tokens",
         "L4s": "L4s Risk analytics, one cloud",
         "L4m": "L4m Risk analytics, all clouds",
         "LAY": "LAY Layered (L1+L2c+L3+L4m)"}
SC = ["S1", "S2", "S3", "S4"]
SCN = {"S1": "S1\nforeign\nhosting", "S2": "S2\nresidential\nproxy",
       "S3": "S3\nOAuth\napp-only", "S4": "S4\ncross-cloud\npivot"}


def box(ax, x, y, w, h, text, ec=BLUE, fc="white", fs=9, lw=1.4, bold=False):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                       ec=ec, fc=fc, lw=lw)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs,
            color=BLACK, fontweight="bold" if bold else "normal", linespacing=1.25)


def arrow(ax, a, b, ls="-", color=BLACK, lw=1.3, rad=0.0):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle="-|>", mutation_scale=11, lw=lw,
                                 ls=ls, color=color, connectionstyle=f"arc3,rad={rad}"))


# ---------------------------------------------------------------- Fig 1
fig, ax = plt.subplots(figsize=(6.6, 2.7))
ax.set_xlim(0, 13.95); ax.set_ylim(0, 5.0); ax.axis("off")
steps = [
    ("1  Password spray", "legacy test tenant\naccount without MFA\n(from late Nov 2023)", "T1110.003  T1078.004"),
    ("2  Foothold", "legacy test OAuth app\nwith elevated access\nidentified", "T1528  T1098"),
    ("3  OAuth apps", "new malicious apps\ncreated, high\npermissions granted", "T1098"),
    ("4  Mailboxes", "apps sign in to\nExchange Online and\nread executive mail", "T1114.002"),
    ("5  Secrets", "secrets found in mail\nused for follow-on\naccess (Mar 2024)", "T1078"),
]
w, gap = 2.45, 0.35
for i, (t, d, tid) in enumerate(steps):
    x = 0.1 + i * (w + gap)
    box(ax, x, 1.95, w, 2.75, "", ec=BLUE)
    ax.text(x + w / 2, 4.2, t, ha="center", va="center", fontsize=8.2, fontweight="bold", color=DBLUE)
    ax.text(x + w / 2, 3.2, d, ha="center", va="center", fontsize=7.8, color=BLACK, linespacing=1.3)
    ax.text(x + w / 2, 2.3, tid, ha="center", va="center", fontsize=7.2, color=BLUE)
    if i < len(steps) - 1:
        arrow(ax, (x + w + 0.02, 3.3), (x + w + gap - 0.02, 3.3))
ax.add_patch(FancyBboxPatch((0.1, 0.15), 13.65, 1.25, boxstyle="round,pad=0.02,rounding_size=0.08",
                            ec=BLACK, fc="white", lw=1.0, ls="--"))
ax.text(6.9, 0.78, "Throughout: residential proxy networks hid the origin of the sign-in attempts,\n"
        "and spray volume rose about ten-fold in February 2024 compared with January [2], [3]",
        ha="center", va="center", fontsize=8.0, color=BLACK, linespacing=1.3)
plt.tight_layout(pad=0.2)
plt.savefig("fig1_chain.png", dpi=220)
plt.close()

# ---------------------------------------------------------------- Fig 2
fig, ax = plt.subplots(figsize=(6.6, 4.1))
ax.set_xlim(0, 10); ax.set_ylim(0, 6.4); ax.axis("off")
box(ax, 3.2, 4.9, 3.6, 1.15, "Identity provider\n(Microsoft Entra ID)\nsign-in, MFA, Conditional Access", fs=8.6, bold=False)
box(ax, 0.2, 2.45, 2.8, 1.15, "Microsoft 365 /\nExchange Online\n(CAE, token protection)", fs=8.6)
box(ax, 3.6, 2.45, 2.8, 1.15, "AWS\nIAM role through\nOIDC federation", fs=8.6)
box(ax, 7.0, 2.45, 2.8, 1.15, "Google Cloud\nworkload identity pool\nSTS token exchange", fs=8.6)
box(ax, 3.2, 0.2, 3.6, 1.0, "Attacker holding a stolen\nsession token or OAuth secret", ec=BLACK, fs=8.6)
for x in (1.6, 5.0, 8.4):
    arrow(ax, (5.0 if x == 5.0 else (4.3 if x < 5 else 5.7), 4.9), (x, 3.62), color=BLACK)
for x in (1.6, 5.0, 8.4):
    arrow(ax, (4.2 if x < 5 else (5.0 if x == 5.0 else 5.8), 1.22), (x, 2.43), ls="--", color=BLACK, rad=0.0)
ax.text(2.2, 4.25, "tokens /\nassertions", fontsize=7.8, ha="center", color=BLACK)
ax.text(8.0, 4.25, "federated\ncredentials", fontsize=7.8, ha="center", color=BLACK)
ax.text(2.0, 1.75, "replay", fontsize=7.8, ha="center", style="italic", color=BLACK)
ax.text(8.1, 1.75, "replay", fontsize=7.8, ha="center", style="italic", color=BLACK)
for n, (x, y) in enumerate([(2.9, 3.05), (0.95, 4.35), (9.35, 4.35), (6.9, 5.45)], 1):
    ax.add_patch(Circle((x, y), 0.19, ec=BLUE, fc=BLUE))
    ax.text(x, y, str(n), color="white", ha="center", va="center", fontsize=8, fontweight="bold")
ax.text(0.05, 1.15, "Blue numbers = control points", fontsize=8.0, color=DBLUE, ha="left")
for k, t in enumerate(["1 device-bound tokens", "2 continuous evaluation", "3 cross-cloud log correlation", "4 app and key governance"]):
    ax.text(0.05, 0.85 - 0.26 * k, t, fontsize=7.6, color=BLACK, ha="left")
plt.tight_layout(pad=0.3)
plt.savefig("fig2_multicloud.png", dpi=220)
plt.close()

# ---------------------------------------------------------------- Fig 3 heatmap
rows = LAYERS
M = np.array([[100 * R[f"{l}|{s}|det"][0] for s in SC] + [100 * R[f"{l}|FP"][0]] for l in rows])
cmap = LinearSegmentedColormap.from_list("bl", ["#FFFFFF", "#9DBDEB", "#0A2A6B"])
fig, ax = plt.subplots(figsize=(6.6, 3.6))
im = ax.imshow(M[:, :4], cmap=cmap, vmin=0, vmax=100, aspect="auto")
ax.set_xticks(range(4)); ax.set_xticklabels([SCN[s] for s in SC], fontsize=8.4)
ax.set_yticks(range(len(rows))); ax.set_yticklabels([NAMES[l] for l in rows], fontsize=8.4)
ax.xaxis.tick_top()
for i in range(len(rows)):
    for j in range(4):
        v = M[i, j]
        ax.text(j, i, f"{v:.0f}%", ha="center", va="center", fontsize=8.8,
                color="white" if v > 55 else BLACK)
# false-positive column as text on the right
ax.set_xlim(-0.5, 4.9)
ax.text(4.35, -0.95, "Legit sessions\nwrongly blocked", ha="center", va="center", fontsize=8.2, color=DBLUE)
for i in range(len(rows)):
    ax.text(4.35, i, f"{M[i,4]:.1f}%", ha="center", va="center", fontsize=8.8, color=BLACK)
ax.axvline(3.5, color=BLACK, lw=0.8)
for sp in ax.spines.values():
    sp.set_color(BLACK)
ax.tick_params(length=0)
plt.tight_layout(pad=0.4)
plt.savefig("fig3_heatmap.png", dpi=220)
plt.close()

# ---------------------------------------------------------------- Fig 4 tradeoff
fig, ax = plt.subplots(figsize=(6.2, 3.6))
pts = {}
for l in LAYERS:
    d = np.mean([100 * R[f"{l}|{s}|det"][0] for s in SC])
    pts[l] = (100 * R[f"{l}|FP"][0], d)
for l, (x, y) in pts.items():
    ax.scatter(x, y, s=48, color=BLUE if l != "LAY" else BLACK, zorder=3)
off = {"L0": (0.5, 2.5), "L1": (0.5, 3.0), "L2c": (0.5, -6.0), "L2a": (-0.5, 4.5), "L3": (0.5, -6.0),
       "L4s": (-2.0, -1.5), "L4m": (0.5, -7.0), "LAY": (0.6, 1.5)}
for l, (x, y) in pts.items():
    ax.annotate(l, (x, y), xytext=(x + off[l][0], y + off[l][1]), fontsize=8.8, color=BLACK)
ax.set_xlabel("Legitimate sessions wrongly blocked (%)")
ax.set_ylabel("Mean detection across S1-S4 (%)")
ax.set_xlim(-1, 25); ax.set_ylim(-5, 100)
ax.grid(True, color=LBLUE, lw=0.8)
for sp in ax.spines.values():
    sp.set_color(BLACK)
plt.tight_layout(pad=0.4)
plt.savefig("fig4_tradeoff.png", dpi=220)
plt.close()

# ---------------------------------------------------------------- Fig 5 sensitivity
fig, axs = plt.subplots(1, 2, figsize=(6.6, 3.0))
cov = list(S["coverage"].keys())
x = [100 * float(c) for c in cov]
ax = axs[0]
ax.plot(x, [100 * S["coverage"][c]["L3|S2|det"][0] for c in cov], "-o", color=BLUE, label="L3 alone")
ax.plot(x, [100 * S["coverage"][c]["LAY|S2|det"][0] for c in cov], "--s", color=BLACK, label="Layered")
ax.set_xlabel("Sessions with device-bound tokens (%)"); ax.set_ylabel("S2 detection (%)")
ax.set_ylim(0, 105); ax.grid(True, color=LBLUE, lw=0.8); ax.legend(fontsize=8, frameon=False, loc="lower right")
ax.set_title("(a) Token-binding coverage", fontsize=9, color=DBLUE)
ax = axs[1]
q = list(S["p_same_asn"].keys()); xq = [100 * float(v) for v in q]
ax.plot(xq, [100 * S["p_same_asn"][v]["L2a|S2|det"][0] for v in q], ":^", color=BLACK, label="L2a (IP/ASN list)")
ax.plot(xq, [100 * S["p_same_asn"][v]["L4m|S2|det"][0] for v in q], "-o", color=BLUE, label="L4m (analytics)")
ax.plot(xq, [100 * S["p_same_asn"][v]["LAY|S2|det"][0] for v in q], "--s", color=DBLUE, label="Layered")
ax.set_xlabel("Proxy on victim's own ISP (%)"); ax.set_ylabel("S2 detection (%)")
ax.set_ylim(0, 105); ax.grid(True, color=LBLUE, lw=0.8); ax.legend(fontsize=8, frameon=False, loc="lower left")
ax.set_title("(b) Proxy placement", fontsize=9, color=DBLUE)
for a in axs:
    for sp in a.spines.values():
        sp.set_color(BLACK)
plt.tight_layout(pad=0.5)
plt.savefig("fig5_sens.png", dpi=220)
plt.close()
print("figs done")
