ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id);

UPDATE orders
SET user_id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)
WHERE user_id IS NULL;
