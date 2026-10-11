# Charge-Off Driver Analysis: Which Purposes, Grades and States Drive Losses?

**Portfolio:** 38,576 applications issued Jan–Dec 2021 · $435.76M funded · $473.07M received
**Charge-offs:** 5,333 loans (13.82%) · $65.53M funded · $37.28M recovered · **net capital loss $28.25M**
All figures are computed from `financial_loan.csv` by the queries in `sql/`. "Charge-off rate" = charged-off loans ÷ all loans in the segment. "Net loss" = funded − received on charged-off loans.

---

## Executive summary

1. **Loan term is the strongest single driver, and it was not on the original hypothesis list.** 60-month loans are 26.8% of volume but 43.3% of charge-offs (22.3% vs 10.7% for 36-month) and **56.4% of the dollar loss ($15.9M)**.
2. **Grade is a clean, monotonic risk ladder.** The charge-off rate rises from 5.7% (A) to 31.3% (G). Grades D–G are 24% of loans but 41% of charge-offs and 47.6% of net loss ($13.4M).
3. **Purpose splits into a rate story and a dollar story.** Small business is the riskiest purpose (25.6%, 1.9× the portfolio rate) but only 11.7% of the loss. Debt consolidation is only mildly above average (14.6%) but, being 47% of loans, **accounts for 53.8% of the net loss ($15.2M)**.
4. **State risk is concentrated in a few places.** Florida (17.3%) and Nevada (21.0%) are statistically elevated with real volume. California is the largest dollar exposure (20.8% of net loss, 15.3% rate). Texas (11.3%) and New York (12.7%) perform well.
5. **The worst pockets stack the drivers.** 60-month small-business loans charge off at 34.6%. Grade E–G renters buying small-business loans charge off at 37.5% (160 loans).

---

## 1. Loan purpose

| Purpose | Loans | Funded ($M) | Charge-off rate | Net loss ($M) | Share of net loss |
|---|---:|---:|---:|---:|---:|
| **Debt consolidation** | 18,214 | 232.5 | 14.55% | 15.20 | **53.8%** |
| **Small business** | 1,776 | 24.1 | **25.62%** | 3.31 | 11.7% |
| Credit card | 4,998 | 58.9 | 10.16% | 2.64 | 9.4% |
| Other | 3,824 | 31.2 | 15.35% | 2.29 | 8.1% |
| Home improvement | 2,876 | 33.4 | 11.37% | 1.85 | 6.6% |
| Major purchase | 2,110 | 17.3 | 9.76% | 0.87 | 3.1% |
| Medical | 667 | 5.5 | 14.99% | 0.42 | 1.5% |
| Car | 1,497 | 10.2 | 10.35% | 0.39 | 1.4% |
| Wedding | 928 | 9.2 | 9.27% | 0.41 | 1.4% |
| Others (5 small purposes) | 1,686 | 13.6 | 14.2–18.1% | 0.86 | 3.1% |

**Reading it:**
- **Small business is a rate problem.** At 25.6% it is the only purpose far outside the pack. It stays risky even for good credit: grades A–D small-business loans still charge off at 23.4%, so the problem is the purpose rather than weak borrowers. Renewable energy (18.1%) is also high but only 94 loans.
- **Debt consolidation is a volume problem.** Its rate is only 0.7 pts above the portfolio, but at 47% of all loans it carries more than half of the dollar loss, so small changes in its rate move total losses more than any other purpose.
- **Safest purposes:** wedding (9.3%), major purchase (9.8%), credit card (10.2%), car (10.4%).

## 2. Credit grade

| Grade | Loans | Charge-off rate | Avg interest rate | Net loss ($M) |
|---|---:|---:|---:|---:|
| A | 9,689 | 5.70% | 7.35% | 1.94 |
| B | 11,674 | 11.50% | 11.03% | 6.67 |
| C | 7,904 | 16.02% | 13.55% | 6.20 |
| D | 5,182 | 20.69% | 15.71% | 5.69 |
| E | 2,786 | 24.80% | 17.71% | 4.52 |
| F | 1,028 | 30.25% | 19.74% | 2.38 |
| G | 313 | 31.31% | 21.40% | 0.85 |

- Risk climbs about 4–5 pts per grade through F, then flattens (F→G is only +1.1 pts, and G has just 313 loans, so that tail is noisy). It is a steady ladder, not a cliff.
- **Pricing check:** from A to G the interest rate rises 14 pts while charge-offs rise 25.6 pts. Whether higher grades are priced adequately depends on loss given default and recoveries; at the portfolio level, charged-off loans still returned 57% of principal ($37.3M of $65.5M), which cushions the loss.
- **Grade B and C produce the largest absolute losses** ($12.9M together) because of volume, even though their rates are mid-range.

## 3. State

Charge-off rate for states with at least 400 loans (to avoid small-sample noise):

| State | Loans | Charge-off rate | Net loss ($M) | Note |
|---|---:|---:|---:|---|
| **NV** | 482 | **20.95%** | 0.59 | Highest rate among material states |
| **FL** | 2,773 | **17.27%** | 2.70 | 9.6% of net loss on 7.2% of loans |
| MO | 660 | 15.76% | 0.47 | |
| OR | 436 | 15.60% | 0.36 | |
| **CA** | 6,894 | 15.33% | **5.89** | Largest exposure: 20.8% of net loss |
| GA | 1,355 | 15.28% | 1.07 | |
| MD | 1,027 | 15.09% | 0.79 | |
| NJ | 1,822 | 14.98% | 1.45 | |
| … | | | | |
| NY | 3,701 | 12.65% | 2.36 | Better than portfolio |
| TX | 2,664 | 11.30% | 1.56 | Better than portfolio |
| PA | 1,482 | 11.40% | 0.77 | Better than portfolio |

- **Do not rank on small states.** NE shows 60% on 5 loans and AK 19% on 78; neither is reliable. Three states (IA, IN, ME) show 0% on 9 or fewer loans.
- FL, NV and CA are elevated by more than ordinary sampling noise (each is more than 3 standard errors above the 13.82% portfolio rate). TX is similarly reliably *below* it.
- The dataset has only state, so city- or ZIP-level concentration cannot be tested.

## 4. Other segments

| Segment | Finding |
|---|---|
| **Term** | 36 mo: 10.71% (28,237 loans) · 60 mo: **22.34%** (10,339 loans). The gap persists inside every grade band: A–C 9.3% vs 17.6%; D–G 18.6% vs 27.3%. |
| Home ownership | Modest spread: Rent 14.57%, Own 13.99%, Mortgage 12.97%. (OTHER 18.4% on 98 loans, too few to rely on.) |
| Verification | Counter-intuitive: Verified 15.70% > Source Verified 14.14% > Not Verified 12.24%. Verification looks like a flag applied to riskier files rather than a protective control. |
| Income | Under $40K: 17.1% (8,415 loans) · $100K+: 10.4% (6,145 loans) |
| DTI | DTI ≤ 10%: 12.0% · DTI > 20%: 15.6% |
| Loan size | Under $5K: 12.9% · $20K+: 17.3% |
| Employment length | Flat: 12.4–14.9% across all bands, so it carries almost no signal. |

## 5. Where the drivers stack ("toxic combinations")

| Combination | Loans | Charge-off rate |
|---|---:|---:|
| Grade E–G · Rent · Small business | 160 | **37.5%** |
| Small business · 60-month | 573 | **34.6%** |
| Grade E–G · Own · Debt consolidation | 140 | 30.7% |
| Grade E–G · Mortgage · Small business | 158 | 29.8% |
| Grade E–G · Rent · Debt consolidation | 1,129 | 28.4% |
| Grade A–D · Rent · Small business | 594 | 25.9% |
| Grade A–D · Debt consolidation · any home status | 15,857 | 12.6% |

Grade E–G debt consolidation alone is 2,318 loans with 644 charge-offs and **$4.8M net loss (17% of the total)**. It is the single largest high-rate pocket and the clearest place to tighten policy.

---

## Recommendations

**Underwriting policy**
1. **Make term a pricing and approval variable.** Require a higher grade floor, or a risk premium, for 60-month loans. This targets the largest loss pool (56% of net loss dollars).
2. **Tighten small-business lending.** Cap small-business exposure, require stronger grade (A–B) for 60-month small-business loans, and collect business financials. Do not rely on grade alone, since grades A–D small-business loans still lose 23%.
3. **Tier debt-consolidation by grade.** Keep growing A–D (about 12.6% charge-off), but add affordability checks (DTI, income) for E–G, which loses 27–31%.

**Pricing**
4. Re-price grades D–G for term. The 60-month D–G cell charges off at 27.3%, far above what a flat grade rate card assumes.
5. Review whether verification status is being used as a risk flag, and whether "Verified" files should carry extra scrutiny.

**Portfolio / geography**
6. Set concentration limits and monitoring for **FL and NV**; run a state-level challenger model before further volume growth there. Watch CA by dollar exposure even though its rate is only slightly above average.
7. Use DTI above 20%, income below $40K and loan size of $20K+ as secondary triggers for manual review.

**Measurement**
8. Track charge-off rate **by issue-month vintage** and by term, since mixing 36- and 60-month loans of different age hides seasoning effects.

---

## Caveats

- This is a single-year, snapshot dataset. Loans issued in late 2021 have had little time to charge off, so rates by issue month and by term are *not* seasoned equally. The 36- vs 60-month gap in particular may be understated or overstated by vintage mix.
- The "Current" status (1,098 loans) is treated as good, as in the plan, but some of those loans may still go bad.
- Association is not causation: grade, term and purpose are correlated (for example, lower grades are more often given longer terms), so use these tables to prioritize investigation and challenger testing rather than as proof of cause.
- Net loss uses `total_payment` as recovered cash and ignores collection costs, so true economic loss is higher.

*Reproduce:* `python scripts/setup_data.py && python scripts/run_sql_validation.py`, then `sql/04_segmentation_analysis.sql`.
