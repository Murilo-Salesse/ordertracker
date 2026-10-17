
INSERT INTO orders (id, customer_name, delivery_address, status, created_at, updated_at) VALUES
(1, 'Mariana Costa', '01310-100 - Av. Paulista, 1578 - Bela Vista, São Paulo/SP', 'RECEBIDO', datetime('now', '-15 minutes'), datetime('now', '-15 minutes')),
(2, 'Rafael Mendes', '04538-132 - Rua Bandeira Paulista, 702 - Itaim Bibi, São Paulo/SP', 'EM_PREPARO', datetime('now', '-35 minutes'), datetime('now', '-20 minutes')),
(3, 'Camila Ferreira', '05409-002 - Rua dos Pinheiros, 498 - Pinheiros, São Paulo/SP', 'SAIU_PARA_ENTREGA', datetime('now', '-50 minutes'), datetime('now', '-10 minutes')),
(4, 'Lucas Oliveira', '04094-050 - Av. Pedro Álvares Cabral, 200 - Vila Mariana, São Paulo/SP', 'ENTREGUE', datetime('now', '-2 hours'), datetime('now', '-1 hour')),
(5, 'Beatriz Santos', '01414-001 - Rua Haddock Lobo, 890 - Cerqueira César, São Paulo/SP', 'CANCELADO', datetime('now', '-3 hours'), datetime('now', '-2 hours'));

-- Itens dos pedidos iniciais
INSERT INTO order_items (order_id, name, quantity, unit_price) VALUES
(1, 'Smash Burger Duplo Bacon', 2, 36.90),
(1, 'Batata Frita Rústica com Alecrim', 1, 19.90),
(1, 'Refrigerante Lata 350ml', 2, 7.50),

(2, 'Pizza Grande Margherita Artesanal', 1, 64.90),
(2, 'Suco Natural de Laranja 500ml', 2, 12.00),

(3, 'Combo Sushi & Sashimi Especial (24 peças)', 1, 89.90),
(3, 'Guioza Suíno (6 unidades)', 1, 26.00),

(4, 'Bowl Poke Salmão Havaiano', 2, 48.50),
(4, 'Água com Gás 500ml', 2, 6.00),

(5, 'Açaí Tradicional 500ml com Granola e Morango', 1, 28.90);
