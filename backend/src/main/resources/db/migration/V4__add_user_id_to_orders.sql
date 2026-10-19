ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Usuário padrão para navegação e demonstração da aplicação (senha: 123456)
INSERT INTO users (id, name, email, password, role)
VALUES (1, 'Admin Foody', 'admin@foodydelivery.com', '$2a$10$YCA5jtLalaxotUBSCTmpk.RibNv5NI.xSFnK3TTj3u7c8jkYeeKCW', 'ADMIN')
ON CONFLICT(email) DO NOTHING;

UPDATE orders
SET user_id = (SELECT id FROM users WHERE email = 'admin@foodydelivery.com' LIMIT 1)
WHERE user_id IS NULL;

