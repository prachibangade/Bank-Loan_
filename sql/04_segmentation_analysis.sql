-- 04_segmentation_analysis.sql | Charge-off risk by segment.
-- Each query: volume, funded $, charge-offs, charge-off rate (count basis),
-- funded $ charged off, net capital loss on charged-off loans, share of all charge-off $ lost.
-- name: by_purpose
SELECT purpose, COUNT(*) AS loans, SUM(loan_amount) AS funded,
       SUM(loan_status='Charged Off') AS charged_off,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,
       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss,
       ROUND(100.0*SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END)
             / (SELECT SUM(loan_amount-total_payment) FROM loans WHERE loan_status='Charged Off'),2) AS share_of_net_loss_pct
FROM loans GROUP BY purpose ORDER BY charge_off_rate_pct DESC;
-- name: by_grade
SELECT grade, COUNT(*) AS loans, SUM(loan_amount) AS funded,
       SUM(loan_status='Charged Off') AS charged_off,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,
       ROUND(AVG(int_rate)*100,2) AS avg_rate_pct,
       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss
FROM loans GROUP BY grade ORDER BY grade;
-- name: by_sub_grade
SELECT sub_grade, COUNT(*) AS loans,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY sub_grade ORDER BY sub_grade;
-- name: by_state
SELECT address_state, COUNT(*) AS loans, SUM(loan_amount) AS funded,
       SUM(loan_status='Charged Off') AS charged_off,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct,
       SUM(CASE WHEN loan_status='Charged Off' THEN loan_amount-total_payment ELSE 0 END) AS net_loss
FROM loans GROUP BY address_state ORDER BY charge_off_rate_pct DESC;
-- name: by_term
SELECT term, COUNT(*) AS loans, SUM(loan_amount) AS funded,
       SUM(loan_status='Charged Off') AS charged_off,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY term ORDER BY term;
-- name: by_home_ownership
SELECT home_ownership, COUNT(*) AS loans, SUM(loan_amount) AS funded,
       SUM(loan_status='Charged Off') AS charged_off,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY home_ownership ORDER BY charge_off_rate_pct DESC;
-- name: by_verification
SELECT verification_status, COUNT(*) AS loans,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY verification_status ORDER BY charge_off_rate_pct DESC;
-- name: by_emp_length
SELECT emp_length, COUNT(*) AS loans,
       ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY emp_length ORDER BY loans DESC;
-- name: cross_grade_home_purpose
SELECT CASE WHEN grade IN ('E','F','G') THEN 'E-G' ELSE 'A-D' END AS grade_band,
       home_ownership, CASE WHEN purpose IN ('small business','debt consolidation','Debt consolidation') THEN purpose ELSE 'all other' END AS purpose_grp,
       COUNT(*) AS loans, ROUND(100.0*SUM(loan_status='Charged Off')/COUNT(*),2) AS charge_off_rate_pct
FROM loans GROUP BY 1,2,3 HAVING loans >= 100 ORDER BY charge_off_rate_pct DESC;
