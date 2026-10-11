-- 02_mtd_mom_metrics.sql | Time intelligence. MTD = Dec 2021 (month 12), PMTD = Nov 2021 (month 11).
-- name: mtd_pmtd_mom
WITH m AS (
  SELECT issue_month AS mth,
         COUNT(id) AS apps, SUM(loan_amount) AS funded, SUM(total_payment) AS received,
         AVG(int_rate)*100 AS avg_rate, AVG(dti)*100 AS avg_dti
  FROM vw_loans WHERE issue_year = 2021 GROUP BY issue_month
)
SELECT cur.mth AS mtd_month, cur.apps AS mtd_apps, prv.apps AS pmtd_apps,
       ROUND(100.0*(cur.apps-prv.apps)/prv.apps, 2)         AS mom_apps_pct,
       cur.funded AS mtd_funded, prv.funded AS pmtd_funded,
       ROUND(100.0*(cur.funded-prv.funded)/prv.funded, 2)   AS mom_funded_pct,
       cur.received AS mtd_received, prv.received AS pmtd_received,
       ROUND(100.0*(cur.received-prv.received)/prv.received, 2) AS mom_received_pct,
       ROUND(cur.avg_rate - prv.avg_rate, 3) AS mom_rate_delta_pts,
       ROUND(cur.avg_dti  - prv.avg_dti, 3)  AS mom_dti_delta_pts
FROM m cur JOIN m prv ON prv.mth = cur.mth - 1
WHERE cur.mth = 12;
-- name: monthly_trend
SELECT issue_month AS month, COUNT(id) AS apps, SUM(loan_amount) AS funded, SUM(total_payment) AS received,
       ROUND(100.0*SUM(CASE WHEN loan_status='Charged Off' THEN 1 ELSE 0 END)/COUNT(*),2) AS charge_off_rate_pct
FROM vw_loans GROUP BY issue_month ORDER BY issue_month;
