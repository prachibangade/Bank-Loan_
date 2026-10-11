-- 00_schema.sql  |  Bank Loan Dashboard  |  SQLite DDL
-- Dates are stored ISO (yyyy-mm-dd) so they sort and compare correctly.
-- Rates (int_rate, dti) are stored as fractions (0.1527 = 15.27%), as in the CSV.
DROP TABLE IF EXISTS loans;
CREATE TABLE loans (
    id                    INTEGER PRIMARY KEY,
    address_state         TEXT    NOT NULL,
    application_type      TEXT,
    emp_length            TEXT,
    emp_title             TEXT,
    grade                 TEXT    NOT NULL,
    home_ownership        TEXT,
    issue_date            TEXT    NOT NULL,
    last_credit_pull_date TEXT,
    last_payment_date     TEXT,
    loan_status           TEXT    NOT NULL,
    next_payment_date     TEXT,
    member_id             INTEGER,
    purpose               TEXT    NOT NULL,
    sub_grade             TEXT,
    term                  INTEGER NOT NULL,   -- months (36 / 60), leading space stripped
    verification_status   TEXT,
    annual_income         REAL,
    dti                   REAL,
    installment           REAL,
    int_rate              REAL,
    loan_amount           INTEGER NOT NULL,
    total_acc             INTEGER,
    total_payment         INTEGER NOT NULL
);
CREATE INDEX idx_loans_issue_date ON loans(issue_date);
CREATE INDEX idx_loans_status     ON loans(loan_status);
CREATE INDEX idx_loans_grade      ON loans(grade);
CREATE INDEX idx_loans_purpose    ON loans(purpose);
CREATE INDEX idx_loans_state      ON loans(address_state);

DROP VIEW IF EXISTS vw_loans;
CREATE VIEW vw_loans AS
SELECT *,
       CAST(strftime('%m', issue_date) AS INTEGER) AS issue_month,
       CAST(strftime('%Y', issue_date) AS INTEGER) AS issue_year,
       CASE WHEN loan_status = 'Charged Off' THEN 'Bad Loan' ELSE 'Good Loan' END AS loan_class
FROM loans;
