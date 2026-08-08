/*
# Add Pricing & Stock to Products

Adds wholesale price, customer price, and total stock to the `products` table.

1. New Columns
- `wholesale_price`: numeric, price for wholesale/bulk buyers (nullable).
- `customer_price`: numeric, retail price for customers (nullable).
- `total_stock`: integer, quantity in stock (defaults to 0).

Existing rows get `total_stock = 0`; prices are null until set in the admin panel.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS customer_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_stock integer NOT NULL DEFAULT 0;
