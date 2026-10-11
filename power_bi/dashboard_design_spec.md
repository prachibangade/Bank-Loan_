# Dashboard Design Spec (3 levels)

## Design tokens
| Token | Hex | Use |
|---|---|---|
| Background | `#0b1220` | Page |
| Card | `#111a2e` | Cards / panels |
| Border | `#22304d` | Dividers |
| Text | `#e6edf7` / muted `#8fa1bf` | |
| Good (Emerald) | `#10b981` | Good loans, Fully Paid, positive MoM |
| Bad (Crimson) | `#ef4444` | Charged Off, negative MoM |
| Current (Amber) | `#f59e0b` | Current loans |
| Accent (Blue) | `#38bdf8` | Neutral series, selected state |
Font: Segoe UI (Power BI default), KPI values 28pt, labels 11pt.

## Level 1: Summary
- **KPI row (5 cards):** Total Applications, Total Funded, Total Received, Avg Interest Rate, Avg DTI. Each shows the MTD value large with a small `MoM` % and ▲/▼ below it (green up, red down, except interest rate and DTI, where up is bad).
- **Good vs Bad loan panel:** two cards (Good % / Bad %), with count, funded and received beneath each. Add `Net Capital Loss` under Bad.
- **Loan status matrix:** rows = loan_status; columns = Applications, Funded, Received, Avg Rate, Avg DTI. Apply `Status Color` as font colour on the status column.
- Slicer: Month (single select, default = latest).

## Level 2: Overview
| Visual | Fields | Notes |
|---|---|---|
| Line/area chart | Month × MTD Funded / Received / Applications | Metric switcher via field parameter |
| Filled map / bar chart | State × Funded; colour by Charge-Off Rate (Min Volume) | Bar chart sorted descending is more readable than the map |
| Bar chart | Purpose × Applications; secondary colour by Charge-Off Rate | |
| Donut | Term (36 / 60) share of applications | Add tooltip with charge-off rate |
| Bar chart | Home ownership × Applications | |
| Column chart | Grade (A→G) × Charge-Off Rate | Shows the risk ladder |
Tooltips: Applications, Funded, Received, Charge-Off Rate, Risk Index.

## Level 3: Details
- Table: id, issue_date, purpose, grade, address_state, term, loan_status, loan_amount, total_payment, int_rate, dti.
- Conditional formatting: loan_status background via `Status Color`; loan_amount data bars.
- Slicers: Grade, Purpose, State, Loan Status, Term, Verification Status.
- Page navigation: Summary ⇄ Overview ⇄ Details buttons in a top bar.
