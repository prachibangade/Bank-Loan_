#!/usr/bin/env python3
"""Run the SQL suite against database/bank_loan.db and assert KPIs against the plan's benchmarks.

Usage:  python scripts/run_sql_validation.py
Exit code 0 = every check passed, 1 = at least one FAIL.
Status meanings: PASS = matches benchmark; FAIL = differs from the benchmark (actual value is shown).
"""
import re, sqlite3, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "database" / "bank_loan.db"
SQLDIR = ROOT / "sql"
G, R, Y, X = "\033[92m", "\033[91m", "\033[93m", "\033[0m"
if not sys.stdout.isatty():
    G = R = Y = X = ""

def load_queries():
    q = {}
    for f in sorted(SQLDIR.glob("0[1-5]_*.sql")):
        for m in re.finditer(r"--\s*name:\s*(\w+)\s*\n(.*?)(?=\n--\s*name:|\Z)", f.read_text(), re.S):
            q[m.group(1)] = m.group(2).strip()
    return q

def main():
    if not DB.exists():
        sys.exit("Database missing. Run: python scripts/setup_data.py")
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    Q = load_queries()
    one = lambda name: dict(con.execute(Q[name]).fetchone())
    kpi, mom, gb = one("kpi_summary"), one("mtd_pmtd_mom"), con.execute(Q["good_vs_bad"]).fetchall()
    good = next(dict(r) for r in gb if r["loan_class"] == "Good Loan")
    bad = next(dict(r) for r in gb if r["loan_class"] == "Bad Loan")
    grade = {r["grade"]: r["charge_off_rate_pct"] for r in con.execute(Q["by_grade"])}
    purp = {r["purpose"]: r["charge_off_rate_pct"] for r in con.execute(Q["by_purpose"])}
    bad_rate = round(100.0 * bad["loans"] / kpi["total_applications"], 2)

    # (label, expected from plan, actual, tolerance, group)
    checks = [
        ("Row count",                       38576,       kpi["total_applications"], 0, "Plan benchmark"),
        ("Total funded amount ($)",         435757075,   kpi["total_funded"], 0, "Plan benchmark"),
        ("Total received amount ($)",       473077733,   kpi["total_received"], 0, "Plan benchmark"),
        ("Average interest rate (%)",       12.05,       kpi["avg_int_rate_pct"], 0.005, "Plan benchmark"),
        ("Average DTI (%)",                 13.33,       kpi["avg_dti_pct"], 0.005, "Plan benchmark"),
        ("Charge-off rate (%)",             13.82,       bad_rate, 0.005, "Plan benchmark"),
        ("MTD applications (Dec 2021)",     4314,        mom["mtd_apps"], 0, "Plan benchmark"),
        ("PMTD applications (Nov 2021)",    4035,        mom["pmtd_apps"], 0, "Plan benchmark"),
        ("MoM application growth (%)",      6.91,        mom["mom_apps_pct"], 0.005, "Plan benchmark"),
        ("Good loan count",                 33244,       good["loans"], 0, "Plan benchmark"),
        ("Bad loan count",                  5332,        bad["loans"], 0, "Plan benchmark"),
        ("Repayment ratio (%)",             108.56,      kpi["repayment_ratio_pct"], 0.005, "Plan benchmark"),
        ("MTD funded ($M)",                 43.99,       round(mom["mtd_funded"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("PMTD funded ($M)",                40.30,       round(mom["pmtd_funded"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("MoM funded growth (%)",           9.15,        mom["mom_funded_pct"], 0.005, "Plan secondary figure"),
        ("MTD received ($M)",               58.07,       round(mom["mtd_received"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("PMTD received ($M)",              50.13,       round(mom["pmtd_received"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("MoM received growth (%)",         15.84,       mom["mom_received_pct"], 0.005, "Plan secondary figure"),
        ("Good loans funded ($M)",          370.22,      round(good["funded"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("Good loans received ($M)",        435.79,      round(good["received"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("Bad loans funded ($M)",           65.53,       round(bad["funded"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("Bad loans received ($M)",         37.28,       round(bad["received"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("Net capital loss ($M)",           -28.25,      round(bad["net_result"]/1e6, 2), 0.005, "Plan secondary figure"),
        ("Grade A charge-off (~6.0%)",      6.0,         grade["A"], 0.5, "Plan indicative (+/-0.5pt)"),
        ("Grade G charge-off (~33.8%)",     33.8,        grade["G"], 0.5, "Plan indicative (+/-0.5pt)"),
        ("Small business charge-off (~27%)",27.0,        purp["small business"], 0.5, "Plan indicative (+/-0.5pt)"),
        # internal integrity
        ("Duplicate IDs",                   0, one("duplicate_ids")["duplicate_ids"], 0, "Data integrity"),
        ("Null required cells",             0, one("null_required_fields")["null_required_cells"], 0, "Data integrity"),
        ("Unexpected status values",        0, one("unexpected_status")["bad_status_rows"], 0, "Data integrity"),
        ("Unexpected term values",          0, one("unexpected_term")["bad_term_rows"], 0, "Data integrity"),
        ("Out-of-range numeric rows",       0, one("out_of_range_values")["out_of_range_rows"], 0, "Data integrity"),
        ("Unclassified good/bad rows",      0, one("status_partition_check")["unclassified_rows"], 0, "Data integrity"),
        ("Good + Bad = total rows",         kpi["total_applications"], good["loans"] + bad["loans"], 0, "Data integrity"),
        ("Good + Bad funded = total",       kpi["total_funded"], good["funded"] + bad["funded"], 0, "Data integrity"),
        ("Monthly funded sums reconcile",   0, one("monthly_sums_reconcile")["funded_diff"], 0, "Data integrity"),
    ]
    fails, group = 0, None
    print(f"\n{'Check':36}{'Expected':>16}{'Actual':>16}{'Diff':>12}  Status")
    for label, exp, act, tol, grp in checks:
        if grp != group:
            print(f"\n-- {grp} --"); group = grp
        diff = act - exp
        ok = abs(diff) <= tol + 1e-9
        fails += not ok
        f = lambda v: f"{v:,.2f}" if isinstance(v, float) else f"{v:,}"
        print(f"{label:36}{f(exp):>16}{f(act):>16}{f(diff):>12}  {(G+'PASS' if ok else R+'FAIL')+X}")
    total = len(checks)
    print(f"\n{total-fails}/{total} checks passed, {fails} differ from the plan's figures.")
    if fails:
        print(f"{Y}FAIL rows show the real value computed from the CSV; see reports/validation_notes.md.{X}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
