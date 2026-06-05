ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);

UPDATE order_items SET subtotal = quantity * unit_price WHERE subtotal IS NULL;