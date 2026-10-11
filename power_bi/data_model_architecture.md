# Data Model: Star Schema

```
 DimDate ──┐
 DimGrade ─┤
 DimPurpose┼──►  FactBankLoan  (38,576 rows, one row per loan, grain = loan id)
 DimState ─┘
```

## Fact table: `FactBankLoan`
Source: `data/financial_loan.csv`. Transformations in Power Query:
| Column | Type | Note |
|---|---|---|
| id | Whole number | key, unique (verified: 0 duplicates) |
| issue_date, last_credit_pull_date, last_payment_date, next_payment_date | Date | Source text is `dd-mm-yyyy`. Use **Change Type with Locale → English (United Kingdom)**, or the date will load as mm-dd and fail or silently swap. |
| term | Whole number | Source is text like `" 36 months"` (leading space). `Text.Trim` → `Number.FromText(Text.BeforeDelimiter(_, " "))` |
| int_rate, dti | Decimal | Fractions; format as percentage |
| loan_amount, total_payment | Whole number | |
| loan_status | Text | `Fully Paid`, `Current`, `Charged Off` |
| purpose | Text | `Debt consolidation` is capitalised in the source; others are lowercase. Apply `Text.Proper` or leave as-is, and be consistent. |

Optional computed column: `Loan Class = IF ( [loan_status] = "Charged Off", "Bad Loan", "Good Loan" )`.

## Dimensions
| Table | Key | Purpose |
|---|---|---|
| `DimDate` | Date | Calendar for time intelligence. **Mark as date table.** Sort `Month` by `Month No`. |
| `DimGrade` | grade | Gives grade a proper A→G sort order |
| `DimPurpose` | purpose | Slicer / axis |
| `DimState` | address_state | Map / bar chart |

## Relationships (all one-to-many, single direction, dim → fact)
| From (one) | To (many) | Active |
|---|---|---|
| DimDate[Date] | FactBankLoan[issue_date] | Yes |
| DimDate[Date] | FactBankLoan[last_payment_date] | No (use `USERELATIONSHIP`) |
| DimGrade[grade] | FactBankLoan[grade] | Yes |
| DimPurpose[purpose] | FactBankLoan[purpose] | Yes |
| DimState[address_state] | FactBankLoan[address_state] | Yes |

## Notes
- The existing `Project bank.pbix` in this folder is the original report; this document describes the clean model to rebuild it on.
- All measures live in `dax_measures.dax`; create a `_Measures` table to hold them.
- Keep the DimDate range at Jan–Dec 2021; widen it if later data is loaded.
