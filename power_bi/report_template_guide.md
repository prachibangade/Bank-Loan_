# Build Guide: Rebuilding the Power BI Report

1. **Open Power BI Desktop → Get data → Text/CSV** → `data/financial_loan.csv`. Choose *Transform Data*.
2. **Power Query**
   - Set the four date columns to *Date* using *Using Locale…* → English (United Kingdom) (the source is `dd-mm-yyyy`).
   - Clean `term`: Trim, then keep the number only; type = Whole number.
   - Confirm 38,576 rows. Rename the query `FactBankLoan`. Close & Apply.
3. **Model**
   - Create `DimDate`, `DimGrade`, `DimPurpose`, `DimState` (code at the bottom of `dax_measures.dax`).
   - Mark `DimDate` as date table. Create the relationships listed in `data_model_architecture.md` (last_payment_date relationship inactive).
4. **Measures**: create an empty table `_Measures` (Enter data), then paste measures from `dax_measures.dax`. Set display folders `01_KPIs` … `04_Risk_Analysis` and number formats (see comments).
5. **Sanity-check** each measure with a card and compare with the web app Summary tab or `scripts/run_sql_validation.py` output. Headline values: 38,576 applications, $435,757,075 funded, $473,070,933 received, 12.05% avg rate, 13.33% avg DTI, 13.82% bad loans. For Dec 2021: 4,314 applications, $53,981,425 funded, $58,074,380 received.
6. **Pages**: build Summary, Overview, Details per `dashboard_design_spec.md`. Use the Page navigator.
7. **Theme**: View → Themes → Customize current theme with the token colours.
8. Save as `Project bank (rebuilt).pbix` so the original `Project bank.pbix` is untouched.
