# Database Tables Guide

## 📊 Restaurants Table

Armazena informações dos restaurantes cadastrados no sistema.

```sql
CREATE TABLE restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  capacity INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Campos

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|------------|
| `id` | INTEGER | Identificador único | ✅ |
| `name` | TEXT | Nome do restaurante | ✅ |
| `address` | TEXT | Endereço completo | ✅ |
| `latitude` | REAL | Coordenada de latitude para geolocalização | ❌ |
| `longitude` | REAL | Coordenada de longitude para geolocalização | ❌ |
| `capacity` | INTEGER | Capacidade total de assentos | ✅ |
| `created_at` | DATETIME | Data e hora de criação (automático) | ✅ |

### Exemplo

```json
{
  "id": 1,
  "name": "Pizzaria Italiana",
  "address": "Rua das Flores, 123, São Paulo, SP",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "capacity": 50,
  "created_at": "2026-02-23T19:00:00.000Z"
}
```

---

## 📅 Reservations Table

Armazena informações das reservas feitas nos restaurantes.

```sql
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  number_of_people INTEGER NOT NULL,
  reservation_date TEXT NOT NULL,
  reservation_time TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
)
```

### Campos

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|------------|
| `id` | INTEGER | Identificador único da reserva | ✅ |
| `restaurant_id` | INTEGER | ID do restaurante (chave estrangeira) | ✅ |
| `customer_name` | TEXT | Nome do cliente | ✅ |
| `number_of_people` | INTEGER | Quantidade de pessoas | ✅ |
| `reservation_date` | TEXT | Data da reserva (formato: YYYY-MM-DD) | ✅ |
| `reservation_time` | TEXT | Hora da reserva (formato: HH:mm) | ✅ |
| `status` | TEXT | Status da reserva (confirmed/cancelled) | ✅ |
| `created_at` | DATETIME | Data e hora de criação (automático) | ✅ |

### Campos de Status

- `confirmed` - Reserva confirmada (padrão)
- `cancelled` - Reserva cancelada

### Exemplo

```json
{
  "id": 1,
  "restaurant_id": 1,
  "customer_name": "João Silva",
  "number_of_people": 4,
  "reservation_date": "2026-03-15",
  "reservation_time": "19:30",
  "status": "confirmed",
  "created_at": "2026-02-23T19:00:00.000Z"
}
```

---

## 🔗 Relacionamento

A tabela `reservations` possui uma relação com a tabela `restaurants` através da chave estrangeira `restaurant_id`.

```
restaurants (1) ──────── (N) reservations
   id    ←──────────── restaurant_id
```

Quando um restaurante é deletado, todas as suas reservas devem ser tratadas de acordo com a política de integridade referencial do sistema.

---

## 💾 Banco de Dados

- **Arquivo**: `restaurant_booking.db`
- **Tipo**: SQLite3
- **Localização**: Raiz do projeto
- **Auto-inicialização**: Tabelas são criadas automaticamente na primeira execução
