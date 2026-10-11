-- 05_data_validation_reconciliation.sql | Every check should return 0 problem rows (or the stated value).
-- name: row_count
SELECT COUNT(*) AS rows_loaded FROM loans;
-- name: duplicate_ids
SELECT COUNT(*) AS duplicate_ids FROM (SELECT id FROM loans GROUP BY id HAVING COUNT(*)>1);
-- name: null_required_fields
SELECT SUM(grade IS NULL)+SUM(purpose IS NULL)+SUM(address_state IS NULL)+SUM(loan_status IS NULL)
     + SUM(issue_date IS NULL)+SUM(loan_amount IS NULL)+SUM(total_payment IS NULL) AS null_required_cells FROM loans;
-- name: null_optional_fields
SELECT SUM(emp_title IS NULL) AS null_emp_title FROM loans;
-- name: unexpected_status
SELECT COUNT(*) AS bad_status_rows FROM loans WHERE loan_status NOT IN ('Fully Paid','Current','Charged Off');
-- name: unexpected_term
SELECT COUNT(*) AS bad_term_rows FROM loans WHERE term NOT IN (36,60);
-- name: out_of_range_values
SELECT COUNT(*) AS out_of_range_rows FROM loans
WHERE loan_amount <= 0 OR total_payment < 0 OR int_rate <= 0 OR int_rate >= 1 OR dti < 0 OR dti > 1;
-- name: date_range
SELECT MIN(issue_date) AS first_issue, MAX(issue_date) AS last_issue FROM loans;
-- name: status_partition_check
SELECT (SELECT COUNT(*) FROM loans) - (SELECT COUNT(*) FROM vw_loans WHERE loan_class IN ('Good Loan','Bad Loan')) AS unclassified_rows;
-- name: monthly_sums_reconcile
SELECT (SELECT SUM(loan_amount) FROM loans) - (SELECT SUM(funded) FROM (SELECT SUM(loan_amount) AS funded FROM loans GROUP BY strftime('%m', issue_date))) AS funded_diff;
