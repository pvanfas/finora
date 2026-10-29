-- Expense Accounts Table
CREATE TABLE IF NOT EXISTS expense_accounts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Accounts Table
CREATE TABLE IF NOT EXISTS income_accounts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_label VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Chart of Accounts View
CREATE OR REPLACE VIEW chart_of_accounts AS
SELECT 
  id,
  'EXPENSE' AS category,
  type,
  code,
  name,
  account_label,
  created_at
FROM expense_accounts
UNION ALL
SELECT 
  id,
  'INCOME' AS category,
  type,
  code,
  name,
  account_label,
  created_at
FROM income_accounts;

-- Seed Expense Accounts
INSERT INTO expense_accounts (type, code, name, account_label) VALUES
  ('PROJECT', '6401', 'Legal & Regulatory Fees', '6401 - Legal & Regulatory Fees'),
  ('CAPEX', '1510', 'Office Improvements & Furnishing', '1510 - Office Improvements & Furnishing'),
  ('OPEX', '6100', 'Rent & Utilities', '6100 - Rent & Utilities'),
  ('OPEX', '6400', 'Professional Services', '6400 - Professional Services'),
  ('OPEX', '6200', 'Marketing & Advertising', '6200 - Marketing & Advertising'),
  ('OPEX', '6920', 'Miscellaneous Expenses', '6920 - Miscellaneous Expenses'),
  ('OPEX', '6106', 'General Office Maintenance', '6106 - General Office Maintenance'),
  ('PROJECT', '6920', 'Miscellaneous Expenses', '6920 - Miscellaneous Expenses'),
  ('PROJECT', '6902', 'Tender Bid Cost - Sack', '6902 - Tender Bid Cost - Sack'),
  ('CAPEX', '1500', 'Equipment', '1500 - Equipment'),
  ('CAPEX', '1514', 'Air Conditioning (HVAC) (Asset)', '1514 - Air Conditioning (HVAC) (Asset)'),
  ('OPEX', '6901', 'Tender Bid Cost - SM Documentation', '6901 - Tender Bid Cost - SM Documentation'),
  ('PROJECT', '5205', 'Event Outsourcing', '5205 - Event Outsourcing'),
  ('OPEX', '6000', 'Salaries & Wages', '6000 - Salaries & Wages'),
  ('CAPEX', '1010', 'Bank Account', '1010 - Bank Account'),
  ('OPEX', '6501', 'Food & Batha', '6501 - Food & Batha'),
  ('OPEX', '6502', 'Company Meetings', '6502 - Company Meetings')
ON CONFLICT DO NOTHING;

-- Seed Income Accounts
INSERT INTO income_accounts (type, code, name, account_label) VALUES
  ('CONTRIBUTION', '3004', 'Capital - Partner D', '3004 - Capital - Partner D'),
  ('CONTRIBUTION', '3005', 'Capital - Partner E', '3005 - Capital - Partner E'),
  ('CONTRIBUTION', '3001', 'Capital - Partner A', '3001 - Capital - Partner A'),
  ('CONTRIBUTION', '3002', 'Capital - Partner B', '3002 - Capital - Partner B'),
  ('CONTRIBUTION', '3003', 'Capital - Partner C', '3003 - Capital - Partner C'),
  ('PROJECT', '4000', 'Service Revenue', '4000 - Service Revenue')
ON CONFLICT DO NOTHING;
