# Data Dictionary: financial_loan.csv

38,576 rows · 24 columns · one row per loan · issue dates 2021-01-01 to 2021-12-12

| Column | Type | Description |
|---|---|---|
| id | integer | Unique loan id (primary key) |
| address_state | text | US state of borrower (50 values incl. DC) |
| application_type | text | Always `INDIVIDUAL` |
| emp_length | text | `< 1 year` … `10+ years` |
| emp_title | text | Employer / job title; 1,438 blanks |
| grade | text | A (best) to G (worst) |
| sub_grade | text | A1…G5 |
| home_ownership | text | RENT, MORTGAGE, OWN, OTHER, NONE |
| issue_date | date | Loan issue date. CSV format `dd-mm-yyyy`, stored ISO in SQLite |
| last_credit_pull_date | date | |
| last_payment_date | date | |
| next_payment_date | date | |
| loan_status | text | Fully Paid (32,145), Charged Off (5,333), Current (1,098) |
| member_id | integer | Borrower id |
| purpose | text | 14 values, e.g. Debt consolidation, credit card, small business |
| term | integer | Months: 36 or 60 (CSV has text with a leading space) |
| verification_status | text | Verified, Source Verified, Not Verified |
| annual_income | decimal | USD |
| dti | decimal | Debt-to-income as a fraction (0.1333 = 13.33%) |
| installment | decimal | Monthly payment, USD |
| int_rate | decimal | Interest rate as a fraction |
| loan_amount | integer | Funded amount, USD |
| total_acc | integer | Total credit accounts |
| total_payment | integer | Amount received to date, USD |

## Business definitions
- **Good loan:** Fully Paid or Current. **Bad loan:** Charged Off.
- **Charge-off rate:** charged-off loans ÷ loans in the segment.
- **Net capital loss:** total_payment − loan_amount on Charged Off loans (= −$28.25M).
- **MTD / PMTD:** December 2021 / November 2021 (the latest two months).
