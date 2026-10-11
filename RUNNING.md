# How to run this project

Requirements: Python 3.8+ (standard library only). No installs needed.

```
python scripts/setup_data.py          # loads financial_loan.csv -> database/bank_loan.db, writes app/data.js + app/queries.js
python scripts/run_sql_validation.py  # checks SQL results against the plan's benchmarks
```

Then open **app/index.html** in a browser (double-click it). Tabs: Summary, Overview, Details, SQL Runner.
The SQL Runner tab downloads the `sql.js` engine from cdnjs the first time, so it needs internet; the other tabs work offline.

`financial_loan.csv` can sit in the project root (where it was downloaded) or in `data/`.

## What the validation shows
27 of 35 checks pass and every data-integrity check passes. 8 checks differ from figures written in the original plan,
and the plan figures are the ones that are off. Details are in `reports/validation_notes.md`, so the runner exits with code 1 on purpose.

## Folder map
| Path | What |
|---|---|
| `sql/` | Schema + 4 analysis files + data validation queries (each query has a `-- name:` tag) |
| `scripts/` | `setup_data.py`, `run_sql_validation.py` |
| `power_bi/` | DAX measures, star-schema design, dashboard spec, rebuild guide |
| `app/` | 3-level web dashboard + SQL runner |
| `reports/charge_off_driver_analysis.md` | Which purposes, grades, states and terms drive charge-offs |
| `reports/validation_notes.md` | Plan vs actual figures |
| `data/data_dictionary.md` | Column definitions |
| `Project bank.pbix`, `README.md` | Your original files, untouched |
