# Token Theft, Session Hijacking and Conditional Access Bypass in Multi-Cloud Architectures
### Case study of the Microsoft Midnight Blizzard campaign

**Cyber Security CA-2 (Part 2), Batch 2023-2027 | Group 22**

| Name | PRN |
|---|---|
| Atharva More | 24070122508 |
| Neel Khule | 24070122510 |
| Tanmay Salunkhe | 24070122515 |
| Velagala Prapul Reddy | 23070122232 |

**GitHub link:** https://github.com/AtharvaMore9388/cybersecurity-ca2-group22-token-hijacking

## What this project is
A case-study report plus a small Python simulator. The simulator creates SYNTHETIC sign-in data and
compares seven post-login controls (MFA only, Conditional Access, continuous access evaluation,
device-bound tokens, risk analytics, and a layered setup) against four token-abuse scenarios:
S1 replay from foreign hosting, S2 replay via residential proxy, S3 OAuth app-only abuse,
S4 cross-cloud pivot. It does not touch any real tenant and does not measure any real product.

## Folder contents
- `src/token_replay_sim.py` simulator (main program)
- `src/make_figs.py` draws the report figures from the results files
- `src/build_report.js` builds the Word report (needs Node.js and the `docx` package; optional)
- `results/` results.json and results_sens.json from our full run (30 seeds)
- `figures/` figures used in the report
- `report/` G22.pdf and the editable Word file
- `run.bat` one-click quick demo on Windows
- `build_exe.bat` builds `dist\token_replay_sim.exe` on Windows
- `requirements.txt` Python packages

## Requirements
Python 3.9 or newer, with `numpy` and `matplotlib`:

    pip install -r requirements.txt

## How to run
**Quick demo (about 10 seconds, 5 seeds):**

    python src/token_replay_sim.py --quick --out results_demo

On Windows you can double-click `run.bat` instead.

**Full experiment (30 seeds plus sensitivity runs, about 3 minutes):**

    python src/token_replay_sim.py --out results

This prints the detection table (detection % per scenario and the false-block %) and writes
`results.json` and `results_sens.json`. The seeds are fixed, so the full run reproduces the
numbers in the report. The quick run uses fewer seeds, so its numbers differ slightly.

**Redraw the figures (after a full run):**

    cd results
    python ../src/make_figs.py

## Windows .exe
The .exe must be built on Windows. On a Windows PC with Python installed, double-click
`build_exe.bat`. The file appears at `dist\token_replay_sim.exe`. Run it from a terminal:

    token_replay_sim.exe --quick --out results_demo

Copy the built `dist` folder into this project before zipping if your faculty wants the exe included.

## Reading the output
Columns S1 to S4 are the share of attack sessions blocked at least once. FP% is the share of
legitimate sessions wrongly blocked. Layers: L0 MFA only, L1 sign-in Conditional Access (country),
L2c continuous evaluation (country), L2a continuous evaluation (IP/ASN), L3 device-bound tokens,
L4s analytics on one cloud's logs, L4m analytics on all clouds' logs, LAY layered.

## Limitations
Synthetic data; probabilities and score weights are our assumptions; no adaptive attacker; not a
test of any Microsoft, AWS or Google service. See Sections 5.6 and 8.4 of the report.
