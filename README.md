# Tracker Delivery — Order Tracker

Sistema full-stack de gestão e rastreamento de pedidos de delivery.

## Estrutura do Repositório

```text
ordertracker/
├── backend/                  # API REST em Java 21 + Spring Boot
├── frontend/                 # Aplicação Web em React + TypeScript + Tailwind CSS
├── postman_collection.json   # Coleção do Postman pronta para importação
└── README.md
```

---

## Tecnologias Utilizadas

### Back-end (`backend/`)
- **Java 21** + **Spring Boot** (WebMVC, Data JPA, Validation, Security)
- **SQLite** + **Flyway** (migrations versionadas `V1`, `V2` e seed inicial `V3`)
- **Autenticação Stateless JWT** (`io.jsonwebtoken / JJWT` + `BCryptPasswordEncoder`)
- **Padronização de Erros RFC 7807** (`ProblemDetail`)
- **Testes Automatizados**: JUnit 5, Mockito, MockMvc e relatório de cobertura **JaCoCo (~90%)**

### Front-end (`frontend/`)
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** (layout responsivo mobile/tablet/desktop)
- **React Hot Toast** (feedback visual de ações e tratamento de erros)
- **Integração ViaCEP** (preenchimento automático de endereço por CEP no cadastro de pedido)

---

## Como Executar o Projeto

### Pré-requisitos
- **Java 21** instalado e configurado no `JAVA_HOME`
- **Node.js 18+** e **npm**

### 1. Subindo o Back-end (Porta `8080`)

No terminal, acesse a pasta `backend`:

```bash
cd backend
./mvnw spring-boot:run
```
*(No Windows PowerShell/CMD, utilize `.\mvnw.cmd spring-boot:run` ou execute a classe `OrdertrackerApplication` diretamente pela sua IDE).*

Ao iniciar, o **Flyway** criará automaticamente o arquivo `ordertracker.db` e executará as 4 migrations:
- `V1__create_users_table.sql`: estrutura de usuários
- `V2__create_orders_tables.sql`: tabelas `orders` e `order_items`
- `V3__seed_initial_orders.sql`: 5 pedidos iniciais em diferentes status
- `V4__add_user_id_to_orders.sql`: isolamento multi-tenant de pedidos por conta e provisionamento de usuário padrão

> **Credenciais padrão para acesso imediato:**
> - **E-mail:** `admin@foodydelivery.com`
> - **Senha:** `123456`
> *(Você também pode criar uma nova conta a qualquer momento na tela de registro).*

#### Executando os testes e relatório de cobertura (JaCoCo)
```bash
cd backend
./mvnw test
```
O relatório HTML de cobertura será gerado em `backend/target/site/jacoco/index.html`.

---

### 2. Subindo o Front-end (Porta `5173`)

Em outro terminal, acesse a pasta `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Acesse no navegador: **`http://localhost:5173`**

---

## Endpoints da API

Todas as rotas de `/api/orders` exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição | Autenticação |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Cadastro de novo usuário (`name`, `email`, `password`) | Pública |
| `POST` | `/api/auth/login` | Login com `email` e `password` (retorna token JWT) | Pública |
| `POST` | `/api/orders` | Cria um novo pedido com itens (inicia como `RECEBIDO`) | Bearer JWT |
| `GET` | `/api/orders` | Lista todos os pedidos ordenados do mais recente ao mais antigo | Bearer JWT |
| `GET` | `/api/orders/{id}` | Busca os detalhes de um pedido por ID | Bearer JWT |
| `PATCH` | `/api/orders/{id}/status` | Atualiza o status do pedido | Bearer JWT |

### Fluxo de Status do Pedido
- `RECEBIDO`
- `EM_PREPARO`
- `SAIU_PARA_ENTREGA`
- `ENTREGUE`
- `CANCELADO`

> Pedidos já finalizados (`ENTREGUE` ou `CANCELADO`) têm alteração de status bloqueada por regra de negócio (`400 Bad Request`).

---

## Decisões Arquiteturais e Boas Práticas

- **Prevenção de N+1 Queries e `open-in-view: false`**: A relação `1:N` entre `OrderEntity` e `OrderItemEntity` é `LAZY`, e as consultas do `OrderRepository` utilizam `@EntityGraph(attributePaths = "items")` para buscar pedidos e itens em um único `LEFT JOIN`.
- **Listagem Operacional no Painel**: O endpoint `GET /api/orders` retorna a lista completa para alimentar os contadores de status em tempo real e a filtragem instantânea no painel operacional React. Em um cenário de alto volume histórico, os pedidos ativos do turno permaneceriam nessa rota e o histórico passado utilizaria paginação (`Pageable`).
- **Concorrência no SQLite**: Configurado `busy_timeout=5000` na URL JDBC para enfileirar escritas simultâneas sem erro de `SQLITE_BUSY`.
- **Testes via Postman**: O arquivo `postman_collection.json` na raiz já possui scripts automáticos que salvam o JWT retornado no Login/Register diretamente na variável `{{token}}` da coleção.
