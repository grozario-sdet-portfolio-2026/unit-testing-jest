# Plano de Testes - Restaurant Booking System (Postman)

## 1. Visão Geral do Sistema

O Sistema de Agendamento de Restaurantes (Restaurant Booking System) é uma API REST construída com Node.js e Express para gerenciar:
- **Restaurantes**: Cadastro, listagem e busca de restaurantes próximos
- **Reservas**: Agendamento, atualização, cancelamento e listagem de reservas
- **Geolocalização**: Integração com LocationIQ para busca de restaurantes por proximidade

**URL Base**: `http://localhost:3000`

---

## 2. Configuração no Postman

### 2.1 Variáveis de Ambiente

Criar um ambiente no Postman com as seguintes variáveis:

```json
{
  "baseUrl": "http://localhost:3000",
  "restaurantId": 1,
  "reservationId": 1,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 1000,
  "amenity": "restaurant"
}
```

**Como adicionar no Postman**:
1. Clicar em "Environments" (canto superior direito)
2. Criar novo ambiente: "Restaurant API Dev"
3. Adicionar as variáveis acima
4. Selecionar o ambiente antes de rodar os testes

### 2.2 Usando Variáveis

Usar `{{baseUrl}}`, `{{restaurantId}}`, etc. nas URLs e corpos das requisições.

---

## 3. Estrutura de Testes

### 3.1 Ordem Recomendada de Execução

1. ✅ **Teste de Saúde da API**
2. 🏪 **Testes de Restaurantes**
3. 📍 **Testes de Busca Próxima**
4. 📅 **Testes de Reservas**

---

## 4. Testes Detalhados

### 4.1 Teste de Saúde da API

#### GET / - Verificar Status da API

**URL**: `{{baseUrl}}/`

**Método**: GET

**Descrição**: Verifica se a API está funcionando corretamente.

**Resposta Esperada** (200):
```json
{
  "message": "Restaurant Booking System"
}
```

**Teste Postman**:
```javascript
pm.test("API Status - 200 OK", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json().message).to.equal("Restaurant Booking System");
});
```

---

### 4.2 Testes de Restaurantes

#### A. POST /api/restaurants - Criar Restaurante

**URL**: `{{baseUrl}}/api/restaurants`

**Método**: POST

**Body (JSON)**:
```json
{
  "name": "Pizzaria Italia",
  "address": "123 Main Street, New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "capacity": 50
}
```

**Resposta Esperada** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pizzaria Italia",
    "address": "123 Main Street, New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "capacity": 50,
    "created_at": "2026-02-23T10:30:00Z"
  }
}
```

**Testes Postman**:
```javascript
// Teste 1: Status 201
pm.test("Criar Restaurante - 201 Created", function () {
    pm.response.to.have.status(201);
});

// Teste 2: Validar estrutura de resposta
pm.test("Resposta contém dados corretos", function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data.name).to.equal("Pizzaria Italia");
    pm.expect(jsonData.data.capacity).to.equal(50);
});

// Teste 3: Guardar ID para próximos testes
pm.environment.set("restaurantId", pm.response.json().data.id);
```

**Casos de Teste**:

| Caso | Body | Status | Esperado |
|------|------|--------|----------|
| Sucesso | Nome, endereço, capacidade, lat/lon | 201 | Restaurant criado |
| Faltam campos | Sem "name" | 400 | Erro: campos obrigatórios |
| Latitude inválida | latitude: 95 | 400 | Erro: latitude fora do intervalo |
| Longitude inválida | longitude: 181 | 400 | Erro: longitude fora do intervalo |
| Capacidade inválida | capacity: "invalid" | 400 | Erro: capacidade deve ser número |

---

#### B. GET /api/restaurants - Listar Restaurantes

**URL**: `{{baseUrl}}/api/restaurants`

**Método**: GET

**Resposta Esperada** (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "Pizzaria Italia",
      "address": "123 Main Street, New York, NY",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "capacity": 50,
      "created_at": "2026-02-23T10:30:00Z"
    }
  ]
}
```

**Testes Postman**:
```javascript
pm.test("Listar Restaurantes - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(Array.isArray(jsonData.data)).to.be.true;
});
```

---

### 4.3 Testes de Busca Próxima

#### GET /api/restaurants/nearby - Buscar Restaurantes Próximos

**URL**: `{{baseUrl}}/api/restaurants/nearby?latitude={{latitude}}&longitude={{longitude}}&radius={{radius}}&amenity={{amenity}}`

**Método**: GET

**Query Parameters**:
- `latitude`: 40.7128 (obrigatório)
- `longitude`: -74.0060 (obrigatório)
- `radius`: 1000 (opcional, padrão: 1000 metros)
- `amenity`: restaurant (opcional, padrão: "restaurant")

**Resposta Esperada** (200):
```json
{
  "success": true,
  "searchParams": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radiusMeters": 1000,
    "amenity": "restaurant"
  },
  "data": [
    {
      "osm_id": 12345,
      "name": "Restaurant Name",
      "latitude": 40.715,
      "longitude": -74.008,
      "type": "restaurant"
    }
  ]
}
```

**Testes Postman**:
```javascript
// Teste 1: Sucesso
pm.test("Buscar Restaurantes Próximos - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(jsonData).to.have.property('searchParams');
});

// Teste 2: Validar parâmetros
pm.test("Parâmetros foram recebidos", function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData.searchParams.latitude).to.equal(40.7128);
    pm.expect(jsonData.searchParams.longitude).to.equal(-74.0060);
});
```

**Casos de Teste**:

| Caso | Query | Status | Esperado |
|------|-------|--------|----------|
| Sucesso | lat + lon válidos | 200 | Lista de restaurantes |
| Faltam coordenadas | Sem latitude | 400 | Erro: latitude obrigatória |
| Latitude inválida | latitude: 95 | 400 | Erro: latitude fora do intervalo |
| Com raio customizado | lat + lon + radius=5000 | 200 | Usa raio fornecido |

---

### 4.4 Testes de Reservas

#### A. POST /api/reservations - Criar Reserva

**URL**: `{{baseUrl}}/api/reservations`

**Método**: POST

**Body (JSON)**:
```json
{
  "restaurant_id": "{{restaurantId}}",
  "customer_name": "John Doe",
  "number_of_people": 4,
  "reservation_date": "2026-12-25",
  "reservation_time": "19:00"
}
```

**Resposta Esperada** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "customer_name": "John Doe",
    "number_of_people": 4,
    "reservation_date": "2026-12-25",
    "reservation_time": "19:00",
    "status": "confirmed",
    "created_at": "2026-02-23T10:30:00Z"
  }
}
```

**Testes Postman**:
```javascript
// Teste 1: Status 201
pm.test("Criar Reserva - 201 Created", function () {
    pm.response.to.have.status(201);
});

// Teste 2: Validar dados
pm.test("Dados da reserva estão corretos", function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(jsonData.data.status).to.equal("confirmed");
    pm.expect(jsonData.data.customer_name).to.equal("John Doe");
});

// Teste 3: Guardar ID
pm.environment.set("reservationId", pm.response.json().data.id);
```

**Casos de Teste**:

| Caso | Body | Status | Esperado |
|------|------|--------|----------|
| Sucesso | Dados válidos | 201 | Reserva criada com status "confirmed" |
| Faltam campos | Sem "customer_name" | 400 | Erro: campos obrigatórios |
| Restaurante não existe | restaurant_id: 99999 | 404 | Erro: restaurante não encontrado |
| Excede capacidade | number_of_people: 100 (capacidade: 50) | 400 | Erro: excede capacidade |
| Data no passado | reservation_date: "2020-01-01" | 400 | Erro: data deve ser futura |
| Número inválido | number_of_people: "invalid" | 400 | Erro: deve ser número |

---

#### B. GET /api/reservations - Listar Reservas

**URL**: `{{baseUrl}}/api/reservations`

**Método**: GET

**Query Parameters** (opcionais):
- `restaurant_id`: Filtrar por restaurante específico

**Resposta Esperada** (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "restaurant_id": 1,
      "customer_name": "John Doe",
      "number_of_people": 4,
      "reservation_date": "2026-12-25",
      "reservation_time": "19:00",
      "status": "confirmed",
      "created_at": "2026-02-23T10:30:00Z"
    }
  ]
}
```

**Testes Postman**:
```javascript
pm.test("Listar Reservas - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(Array.isArray(jsonData.data)).to.be.true;
});
```

---

#### C. GET /api/reservations/:id - Obter Reserva Específica

**URL**: `{{baseUrl}}/api/reservations/{{reservationId}}`

**Método**: GET

**Resposta Esperada** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "customer_name": "John Doe",
    "number_of_people": 4,
    "reservation_date": "2026-12-25",
    "reservation_time": "19:00",
    "status": "confirmed",
    "created_at": "2026-02-23T10:30:00Z"
  }
}
```

**Testes Postman**:
```javascript
pm.test("Obter Reserva - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.data.id).to.equal(parseInt(pm.environment.get("reservationId")));
});
```

**Casos de Teste**:

| Caso | ID | Status | Esperado |
|------|-----|--------|----------|
| Sucesso | ID válido | 200 | Retorna dados da reserva |
| Não existe | 99999 | 404 | Erro: reserva não encontrada |

---

#### D. PUT /api/reservations/:id - Atualizar Reserva  

**URL**: `{{baseUrl}}/api/reservations/{{reservationId}}`

**Método**: PUT

**Body (JSON)**:
```json
{
  "customer_name": "Jane Doe",
  "number_of_people": 6
}
```

**Resposta Esperada** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "customer_name": "Jane Doe",
    "number_of_people": 6,
    "reservation_date": "2026-12-25",
    "reservation_time": "19:00",
    "status": "confirmed",
    "updated_at": "2026-02-23T10:35:00Z"
  }
}
```

**Testes Postman**:
```javascript
pm.test("Atualizar Reserva - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.data.customer_name).to.equal("Jane Doe");
    pm.expect(jsonData.data.number_of_people).to.equal(6);
});
```

**Casos de Teste**:

| Caso | Body | Status | Esperado |
|------|------|--------|----------|
| Sucesso | Dados válidos | 200 | Reserva atualizada |
| Excede capacidade | number_of_people: 100 | 400 | Erro: excede capacidade |
| Não existe | ID: 99999 | 404 | Erro: reserva não encontrada |

---

#### E. DELETE /api/reservations/:id - Deletar Reserva

**URL**: `{{baseUrl}}/api/reservations/{{reservationId}}`

**Método**: DELETE

**Resposta Esperada** (200):
```json
{
  "success": true,
  "message": "Reservation with ID 1 deleted successfully"
}
```

**Testes Postman**:
```javascript
pm.test("Deletar Reserva - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(jsonData.message).to.include("deleted");
});
```

**Casos de Teste**:

| Caso | ID | Status | Esperado |
|------|-----|--------|----------|
| Sucesso | ID válido | 200 | Reserva deletada |
| Não existe | 99999 | 404 | Erro: reserva não encontrada |

---

#### F. PATCH /api/reservations/:id/cancel - Cancelar Reserva

**URL**: `{{baseUrl}}/api/reservations/{{reservationId}}/cancel`

**Método**: PATCH

**Resposta Esperada** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "customer_name": "Jane Doe",
    "number_of_people": 6,
    "reservation_date": "2026-12-25",
    "reservation_time": "19:00",
    "status": "cancelled",
    "updated_at": "2026-02-23T10:40:00Z"
  }
}
```

**Testes Postman**:
```javascript
pm.test("Cancelar Reserva - 200 OK", function () {
    pm.response.to.have.status(200);
    let jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal("cancelled");
});
```

**Casos de Teste**:

| Caso | ID | Status | Esperado |
|------|-----|--------|----------|
| Sucesso | ID válido | 200 | Status muda para "cancelled" |
| Não existe | 99999 | 404 | Erro: reserva não encontrada |

---

## 5. Fluxo Completo de Teste

### Cenário 1: Cliente Cria Restaurante e Faz Reserva

```
1. POST /api/restaurants
   ↓ (Guardar restaurantId)
2. POST /api/reservations (usando restaurantId)
   ↓ (Guardar reservationId)
3. GET /api/reservations/{{reservationId}}
   ↓
4. PUT /api/reservations/{{reservationId}} (atualizar dados)
   ↓
5. GET /api/reservations (verificar na lista)
```

### Cenário 2: Busca de Restaurantes Próximos

```
1. POST /api/restaurants (com coordenadas)
2. GET /api/restaurants/nearby (com mesmas coordenadas)
   ↓
3. Verificar se o restaurante criado aparece na busca
```

### Cenário 3: Gerenciamento de Reservas

```
1. POST /api/reservations (criar)
2. PUT /api/reservations/:id (atualizar)
3. PATCH /api/reservations/:id/cancel (cancelar)
4. DELETE /api/reservations/:id (deletar)
```

---

## 6. Checklist de Validação

- [ ] API inicializa com sucesso (GET /)
- [ ] Criar restaurante funciona (POST /api/restaurants)
- [ ] Listar restaurantes funciona (GET /api/restaurants)
- [ ] Buscar restaurantes próximos funciona (GET /api/restaurants/nearby)
- [ ] Criar reserva funciona (POST /api/reservations)
- [ ] Listar reservas funciona (GET /api/reservations)
- [ ] Obter reserva específica funciona (GET /api/reservations/:id)
- [ ] Atualizar reserva funciona (PUT /api/reservations/:id)
- [ ] Cancelar reserva funciona (PATCH /api/reservations/:id/cancel)
- [ ] Deletar reserva funciona (DELETE /api/reservations/:id)
- [ ] Validações de erro funcionam corretamente
- [ ] Mensagens de erro são informativas
- [ ] Todos os status codes estão corretos

---

## 7. Como Usar Este Plano

1. **Criar Collection no Postman**: Importar as requisições deste documento
2. **Configurar Environment**: Adicionar as variáveis de ambiente
3. **Executar Testes**: Rodar requisições na ordem recomendada
4. **Verificar Resultados**: Validar respostas contra o esperado
5. **Documentar Discrepâncias**: Anotar qualquer comportamento inesperado

---

## 8. Comandos Úteis

### Iniciar o servidor:
```bash
npm start
```

### Rodar testes automatizados (Jest):
```bash
npm test
```

### Rodar testes com cobertura:
```bash
npm test -- --coverage
```

---

**Data de Criação**: 23 de fevereiro de 2026  
**Versão**: 1.0  
**Status**: Pronto para validação em Postman
