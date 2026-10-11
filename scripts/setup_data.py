#!/usr/bin/env python3
"""Load data/financial_loan.csv into database/bank_loan.db (SQLite) and export app/data.js.

Usage:  python scripts/setup_data.py
Needs only the Python standard library.
"""
import csv, json, sqlite3, sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# The CSV may sit in data/ (planned layout) or directly in the project root (as downloaded).
CSV = next((c for c in (ROOT / "data" / "financial_loan.csv", ROOT / "financial_loan.csv") if c.exists()),
           ROOT / "data" / "financial_loan.csv")
DB = ROOT / "database" / "bank_loan.db"
SCHEMA = ROOT / "sql" / "00_schema.sql"
APPDATA = ROOT / "app" / "data.js"
EXPECTED_ROWS = 38576
DATE_COLS = ["issue_date", "last_credit_pull_date", "last_payment_date", "next_payment_date"]
COLS = ["id","address_state","application_type","emp_length","emp_title","grade","home_ownership",
        "issue_date","last_credit_pull_date","last_payment_date","loan_status","next_payment_date",
        "member_id","purpose","sub_grade","term","verification_status","annual_income","dti",
        "installment","int_rate","loan_amount","total_acc","total_payment"]

def iso(s):
    s = (s or "").strip()
    if not s:
        return None
    for fmt in ("%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    raise ValueError(f"Unparseable date: {s!r}")

def clean(row):
    r = {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
    for c in DATE_COLS:
        r[c] = iso(r[c])
    r["term"] = int(r["term"].split()[0])
    for c in ("id", "member_id", "loan_amount", "total_acc", "total_payment"):
        r[c] = int(float(r[c]))
    for c in ("annual_income", "dti", "installment", "int_rate"):
        r[c] = float(r[c])
    r["emp_title"] = r["emp_title"] or None
    return r

def main():
    if not CSV.exists():
        sys.exit("Missing financial_loan.csv. Put it in the project root or in data/.")
    with open(CSV, newline="", encoding="utf-8-sig") as f:
        rows = [clean(r) for r in csv.DictReader(f)]
    missing = set(COLS) - set(rows[0].keys())
    if missing:
        sys.exit(f"CSV is missing columns: {sorted(missing)}")
    DB.parent.mkdir(exist_ok=True)
    con = sqlite3.connect(DB)
    con.executescript(SCHEMA.read_text())
    con.executemany(f"INSERT INTO loans ({','.join(COLS)}) VALUES ({','.join('?'*len(COLS))})",
                    [[r[c] for c in COLS] for r in rows])
    con.commit()
    n = con.execute("SELECT COUNT(*) FROM loans").fetchone()[0]
    print(f"Loaded {n:,} rows into {DB}")
    if n != EXPECTED_ROWS:
        print(f"WARNING: expected {EXPECTED_ROWS:,} rows")

    # Compact column-oriented export for the browser app (no server / fetch needed)
    keep = ["id","address_state","grade","sub_grade","home_ownership","issue_date","loan_status","purpose",
            "term","verification_status","emp_length","annual_income","dti","installment","int_rate",
            "loan_amount","total_payment"]
    cols = {c: [r[c] for r in rows] for c in keep}
    APPDATA.write_text("window.LOAN_DATA = " + json.dumps(cols, separators=(",", ":")) + ";\n")
    print(f"Wrote {APPDATA} ({APPDATA.stat().st_size/1e6:.1f} MB)")

    # Named queries from sql/*.sql for the app's SQL Runner tab
    import re
    presets = {}
    for f in sorted((ROOT / "sql").glob("0[1-5]_*.sql")):
        for m in re.finditer(r"--\s*name:\s*(\w+)\s*\n(.*?)(?=\n--\s*name:|\Z)", f.read_text(), re.S):
            presets[m.group(1)] = {"file": f.name, "sql": m.group(2).strip()}
    (ROOT / "app" / "queries.js").write_text("window.SQL_PRESETS = " + json.dumps(presets, indent=1) + ";\n")
    print(f"Wrote app/queries.js ({len(presets)} queries)")
    con.close()

if __name__ == "__main__":
    main()
