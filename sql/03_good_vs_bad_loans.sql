-- 03_good_vs_bad_loans.sql | Good = Fully Paid + Current ; Bad = Charged Off
-- name: good_vs_bad
SELECT loan_class,
       COUNT(id) AS loans,
       ROUND(100.0*COUNT(id)/(SELECT COUNT(*) FROM loans), 2) AS pct_of_loans,
       SUM(loan_amount) AS funded,
       SUM(total_payment) AS received,
       SUM(total_payment) - SUM(loan_amount) AS net_result
FROM vw_loans GROUP BY loan_class ORDER BY loan_class DESC;
-- name: loan_status_matrix
SELECT loan_status, COUNT(id) AS loans, SUM(loan_amount) AS funded, SUM(total_payment) AS received,
       ROUND(AVG(int_rate)*100,2) AS avg_rate_pct, ROUND(AVG(dti)*100,2) AS avg_dti_pct
FROM loans GROUP BY loan_status ORDER BY loans DESC;
