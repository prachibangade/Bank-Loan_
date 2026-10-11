# Validation Notes: Plan Benchmarks vs the Real CSV

`scripts/run_sql_validation.py` compares the SQL results with the figures in the implementation plan.
The SQL is correct, and the differences below come from figures in the plan that do not match `financial_loan.csv` (38,576 rows, no duplicates, no nulls in required fields).

## Result: 27 of 35 checks pass, and every data-integrity check passes

| Check | Plan | Actual (CSV) | Comment |
|---|---:|---:|---|
| Total received | $473,077,733 | **$473,070,933** | Off by $6,800 (0.001%). The plan rounded or mistyped; the "~$473.1M" headline still holds. |
| Good loan count | 33,244 | **33,243** | 1 loan |
| Bad loan count | 5,332 | **5,333** | 1 loan. The 13.82% charge-off rate is unaffected. |
| MTD funded (Dec) | $43.99M | **$53.98M** | Plan figure is wrong. $43.99M is roughly Oct–Nov scale; December funded is $53,981,425. |
| PMTD funded (Nov) | $40.30M | **$47.75M** | Plan figure is wrong ($47,754,825). |
| MoM funded growth | +9.15% | **+13.04%** | Follows from the two rows above. |
| Grade G charge-off | ~33.8% | **31.31%** | Plan's approximate figure is high (313 loans). |
| Small business charge-off | ~27% | **25.62%** | Plan's approximate figure is high. |
| Grade A charge-off | ~6.0% | 5.70% | Passes at the ±0.5pt tolerance used for "~" figures. |

Everything else (row count, funded, interest rate, DTI, charge-off rate, applications MTD/PMTD, MoM application and received growth, good/bad funded and received, net loss $28.25M, repayment ratio 108.56%) matches exactly.

The dashboard, DAX and report use the **real computed values**.
