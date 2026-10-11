-- 01_kpi_metrics.sql | Overall portfolio KPIs
-- name: total_applications
SELECT COUNT(id) AS total_applications FROM loans;
-- name: total_funded_amount
SELECT SUM(loan_amount) AS total_funded_amount FROM loans;
-- name: total_amount_received
SELECT SUM(total_payment) AS total_amount_received FROM loans;
-- name: avg_interest_rate_pct
SELECT ROUND(AVG(int_rate) * 100, 2) AS avg_interest_rate_pct FROM loans;
-- name: avg_dti_pct
SELECT ROUND(AVG(dti) * 100, 2) AS avg_dti_pct FROM loans;
-- name: repayment_ratio_pct
SELECT ROUND(100.0 * SUM(total_payment) / SUM(loan_amount), 2) AS repayment_ratio_pct FROM loans;
-- name: kpi_summary
SELECT COUNT(id) AS total_applications,
       SUM(loan_amount) AS total_funded,
       SUM(total_payment) AS total_received,
       ROUND(AVG(int_rate)*100, 2) AS avg_int_rate_pct,
       ROUND(AVG(dti)*100, 2) AS avg_dti_pct,
       ROUND(100.0*SUM(total_payment)/SUM(loan_amount), 2) AS repayment_ratio_pct
FROM loans;
