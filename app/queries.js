window.SQL_PRESETS = {
 "total_applications": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT COUNT(id) AS total_applications FROM loans;"
 },
 "total_funded_amount": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT SUM(loan_amount) AS total_funded_amount FROM loans;"
 },
 "total_amount_received": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT SUM(total_payment) AS total_amount_received FROM loans;"
 },
 "avg_interest_rate_pct": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT ROUND(AVG(int_rate) * 100, 2) AS avg_interest_rate_pct FROM loans;"
 },
 "avg_dti_pct": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT ROUND(AVG(dti) * 100, 2) AS avg_dti_pct FROM loans;"
 },
 "repayment_ratio_pct": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT ROUND(100.0 * SUM(total_payment) / SUM(loan_amount), 2) AS repayment_ratio_pct FROM loans;"
 },
 "kpi_summary": {
  "file": "01_kpi_metrics.sql",
  "sql": "SELECT COUNT(id) AS total_applications,\n       SUM(loan_amount) AS total_funded,\n       SUM(total_payment) AS total_received,\n       ROUND(AVG(int_rate)*100, 2) AS avg_int_rate_pct,\n       ROUND(AVG(dti)*100, 2) AS avg_dti_pct,\n       ROUND(100.0*SUM(total_payment)/SUM(loan_amount), 2) AS repayment_ratio_pct\nFROM loans;"
 },
 "mtd_pmtd_mom": {
  "file": "02_mtd_mom_metrics.sql",
  "sql": "WITH m AS (\n  SELECT issue_month AS mth,\n         COUNT(id) AS apps, SUM(loan_amount) AS funded, SUM(total_payment) AS received,\n         AVG(int_rate)*100 AS avg_rate, AVG(dti)*100 AS avg_dti\n  FROM vw_loans WHERE issue_year = 2021 GROUP BY issue_month\n)\nSELECT cur.mth AS mtd_month, cur.apps AS mtd_apps, prv.apps AS pmtd_apps,\n       ROUND(100.0*(cur.apps-prv.apps)/prv.apps, 2)         AS mom_apps_pct,\n       cur.funded AS mtd_funded, prv.funded AS pmtd_funded,\n       ROUND(100.0*(cur.funded-prv.funded)/prv.funded, 2)   AS mom_funded_pct,\n       cur.received AS mtd_received, prv.received AS pmtd_received,\n       ROUND(100.0*(cur.received-prv.received)/prv.received, 2) AS mom_received_pct,\n       ROUND(cur.avg_rate - prv.avg_rate, 3) AS mom_rate_delta_pts,\n       ROUND(cur.avg_dti  - prv.avg_dti, 3)  AS mom_dti_delta_pts\nFROM m cur JOIN m prv ON prv.mth = cur.mth - 1\nWHERE cur.mth = 12;"
 },
 "monthly_trend": {
  "file": "02_mtd_mom_metrics.sql",
  "sql": "SELECT issue_month AS month, COUNT(id) AS apps, SUM(loan_amount) AS funded, SUM(total_payment) AS received,\n       ROUND(100.0*SUM(CASE WHEN loan_status='Charged Off' THEN 1 ELSE 0 END)/COUNT(*),2) AS charge_off_rate_pct\nFROM vw_loans GROUP BY issue_month ORDER BY issue_month;"
 },
 "good_vs_bad": {
  "file": "03_good_vs_bad_loans.sql",
  "sql": "SELECT loan_class,\n       COUNT(id) AS loans,\n       ROUND(100.0*COUNT(id)/(SELECT COUNT(*) FROM loans), 2) AS pct_of_loans,\n       SUM(loan_amount) AS funded,\n       SUM(total_payment) AS received,\n       SUM(total_payment) - SUM(loan_amount) AS net_result\nFROM vw_loans GROUP BY loan_class ORDER BY loan_class DESC;"
 },
 "loan_status_matrix": {
  "file": "03_good_vs_bad_loans.sql",
  "sql": "SELECT loan_status, COUNT(id) AS loans, SUM(loan_amount) AS funded, SUM(total_payment) AS received,\n       ROUND(AVG(int_rate)*100,2) AS avg_rate_pct, ROUND(AVG(dti)*100,2) AS avg_dti_pct\nFROM loans GROUP BY loan_status ORDER BY loans DESC;"
 },
 "by_purpose": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT purpose, COUNT(*) AS loans, SUM(loan_amount) AS funded,\n       SUM(loan_status='Charged Off') AS charged_off,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,\n       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss,\n       ROUND(100.0*SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END)\n             / (SELECT SUM(loan_amount-total_payment) FROM loans WHERE loan_status='Charged Off'),2) AS share_of_net_loss_pct\nFROM loans GROUP BY purpose ORDER BY charge_off_rate_pct DESC;"
 },
 "by_grade": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT grade, COUNT(*) AS loans, SUM(loan_amount) AS funded,\n       SUM(loan_status='Charged Off') AS charged_off,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,\n       ROUND(AVG(int_rate)*100,2) AS avg_rate_pct,\n       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss\nFROM loans GROUP BY grade ORDER BY grade;"
 },
 "by_sub_grade": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT sub_grade, COUNT(*) AS loans,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY sub_grade ORDER BY sub_grade;"
 },
 "by_state": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT address_state, COUNT(*) AS loans, SUM(loan_amount) AS funded,\n       SUM(loan_status='Charged Off') AS charged_off,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,\n       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss\nFROM loans GROUP BY address_state ORDER BY charge_off_rate_pct DESC;"
 },
 "by_term": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT term, COUNT(*) AS loans, SUM(loan_amount) AS funded,\n       SUM(loan_status='Charged Off') AS charged_off,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY term ORDER BY term;"
 },
 "by_home_ownership": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT home_ownership, COUNT(*) AS loans, SUM(loan_amount) AS funded,\n       SUM(loan_status='Charged Off') AS charged_off,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY home_ownership ORDER BY charge_off_rate_pct DESC;"
 },
 "by_verification": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT verification_status, COUNT(*) AS loans,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY verification_status ORDER BY charge_off_rate_pct DESC;"
 },
 "by_emp_length": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT emp_length, COUNT(*) AS loans,\n       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY emp_length ORDER BY loans DESC;"
 },
 "cross_grade_home_purpose": {
  "file": "04_segmentation_analysis.sql",
  "sql": "SELECT CASE WHEN grade IN ('E','F','G') THEN 'E-G' ELSE 'A-D' END AS grade_band,\n       home_ownership, CASE WHEN purpose IN ('small business','debt consolidation','Debt consolidation') THEN purpose ELSE 'all other' END AS purpose_grp,\n       COUNT(*) AS loans, ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct\nFROM loans GROUP BY 1,2,3 HAVING loans >= 100 ORDER BY charge_off_rate_pct DESC;"
 },
 "row_count": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT COUNT(*) AS rows_loaded FROM loans;"
 },
 "duplicate_ids": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT COUNT(*) AS duplicate_ids FROM (SELECT id FROM loans GROUP BY id HAVING COUNT(*)>1);"
 },
 "null_required_fields": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT SUM(grade IS NULL)+SUM(purpose IS NULL)+SUM(address_state IS NULL)+SUM(loan_status IS NULL)\n     + SUM(issue_date IS NULL)+SUM(loan_amount IS NULL)+SUM(total_payment IS NULL) AS null_required_cells FROM loans;"
 },
 "null_optional_fields": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT SUM(emp_title IS NULL) AS null_emp_title FROM loans;"
 },
 "unexpected_status": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT COUNT(*) AS bad_status_rows FROM loans WHERE loan_status NOT IN ('Fully Paid','Current','Charged Off');"
 },
 "unexpected_term": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT COUNT(*) AS bad_term_rows FROM loans WHERE term NOT IN (36,60);"
 },
 "out_of_range_values": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT COUNT(*) AS out_of_range_rows FROM loans\nWHERE loan_amount <= 0 OR total_payment < 0 OR int_rate <= 0 OR int_rate >= 1 OR dti < 0 OR dti > 1;"
 },
 "date_range": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT MIN(issue_date) AS first_issue, MAX(issue_date) AS last_issue FROM loans;"
 },
 "status_partition_check": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT (SELECT COUNT(*) FROM loans) - (SELECT COUNT(*) FROM vw_loans WHERE loan_class IN ('Good Loan','Bad Loan')) AS unclassified_rows;"
 },
 "monthly_sums_reconcile": {
  "file": "05_data_validation_reconciliation.sql",
  "sql": "SELECT (SELECT SUM(loan_amount) FROM loans) - (SELECT SUM(funded) FROM (SELECT SUM(loan_amount) AS funded FROM loans GROUP BY strftime('%m', issue_date))) AS funded_diff;"
 }
};
