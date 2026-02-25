# Sistema de Agendamento de Restaurantes

[![Jest](https://img.shields.io/badge/tested_with-jest-99424f?style=flat-square)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square)](./coverage/lcov-report/index.html)
[![Branch Coverage](https://img.shields.io/badge/branch_coverage-100%25-brightgreen?style=flat-square)](./coverage/lcov-report/index.html)
[![Tests](https://img.shields.io/badge/tests-624%20passed-brightgreen?style=flat-square)](./tests)

Um sistema robusto de API REST para gerenciar reservas em restaurantes com integração geolocalização via LocationIQ para buscar restaurantes próximos. O projeto é desenvolvido em Node.js com Express, utiliza SQLite para persistência de dados e Jest para testes unitários.

## Características

- ✅ **Gerenciamento de Restaurantes**: Cadastro, listagem, atualização e exclusão de restaurantes
- ✅ **Gerenciamento de Reservas**: Agendamento, alteração, cancelamento e listagem de reservas
- ✅ **Busca Geolocalizada**: Encontre restaurantes próximos utilizando coordenadas (latitude/longitude)
- ✅ **Integração com LocationIQ**: Serviço de geocodificação para buscar restaurantes por proximidade
- ✅ **Testes Unitários**: Cobertura completa de testes com Jest
- ✅ **Documentação Interativa**: Swagger/OpenAPI para exploração dos endpoints
- ✅ **Tratamento de Erros**: Sistema centralizado de tratamento e logging de erros
- ✅ **Validação de Dados**: Validação completa de entrada de dados tipo middleware

## Requisitos

- Node.js v14 ou superior
- npm ou yarn
- Chave da API LocationIQ (gratuita em https://locationiq.com/)

## Instalação

### 1. Clone ou acesse o repositório

```bash
cd unit-testing-jest
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione:
- Sua chave da API LocationIQ
- Porta do servidor (padrão: 3000)
- Ambiente (development/production)

```env
PORT=3000
NODE_ENV=development
LOCATION_IQ_KEY=sua_chave_aqui
```

## Uso

### Iniciar o servidor

```bash
npm start
```

O servidor rodará em `http://localhost:3000`

### Documentação Interativa (Swagger)

Após iniciar o servidor, acesse a documentação interativa em:

```
http://localhost:3000/api/docs
```

Nesta interface, você pode explorar todos os endpoints disponíveis, visualizar schemas de request/response e fazer chamadas de teste.

### Executar Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## Estrutura do Projeto

```
unit-testing-jest/
├── src/
│   ├── clients/              # Clientes de API externa
│   │   └── locationiq.js     # Cliente LocationIQ
│   ├── constants/            # Constantes da aplicação
│   ├── controllers/          # Controladores de negócio
│   │   ├── restaurantController.js
│   │   └── reservationController.js
│   ├── factories/            # Factory pattern para instâncias
│   ├── infra/                # Camada de infraestrutura
│   │   ├── http/
│   │   │   └── routes.js     # Definição de rotas
│   │   ├── sqlite/           # Configuração do SQLite
│   │   └── swagger.js        # Configuração Swagger/OpenAPI
│   ├── interfaces/           # Interfaces e tipos
│   ├── middlewares/          # Middlewares de validação
│   ├── services/             # Lógica de negócio
│   └── utils/                # Utilitários
│       ├── errorHandler.js   # Tratamento de erros
│       ├── logger.js         # Sistema de logs
│       ├── responseHandler.js # Formatação de respostas
│       └── validators.js     # Validadores
├── tests/                    # Testes unitários
├── docs/                      # Documentação do projeto
├── data/                     # Dados e scripts
├── coverage/                 # Relatórios de cobertura
├── app.js                    # Ponto de entrada
├── jest.config.js            # Configuração Jest
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## Endpoints da API

### Saúde da API
- `GET /` - Verificar se a API está rodando

### Restaurantes
- `GET /api/restaurants` - Listar todos os restaurantes
- `POST /api/restaurants` - Criar novo restaurante
- `GET /api/restaurants/:id` - Obter restaurante por ID
- `PUT /api/restaurants/:id` - Atualizar restaurante
- `DELETE /api/restaurants/:id` - Deletar restaurante
- `GET /api/restaurants/nearby` - Buscar restaurantes próximos (geolocalização)

### Reservas
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Criar reserva
- `GET /api/reservations/:id` - Obter reserva por ID
- `PUT /api/reservations/:id` - Atualizar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva

Para detalhes completos dos endpoints, schemas e exemplos, consulte a documentação Swagger em `/api/docs`.

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente de execução | development |
| `LOCATION_IQ_KEY` | Chave da API LocationIQ | - |

## Boas Práticas Implementadas

### SOLID Principles
- **S**ingle Responsibility: Cada classe/função tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Contratos bem definidos
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Inversão de dependências

### Padrões de Código
- Nomes descritivos e autoexplicativos
- Funções pequenas com propósito claro
- Tratamento centralizado de erros
- Logging estruturado
- Validação de entrada em middlewares

### Testes
- Cobertura completa com Jest
- Testes unitários e de integração
- Mock de APIs externas
- Testes de validação

## Documentação

Veja a pasta `docs/` para documentação adicional:
- `SETUP.md` - Guia de configuração
- `TESTING_STRATEGY.md` - 📋 **Estratégia de Testes** (Padrões, cobertura, boas práticas e exemplos)
- `POSTMAN_TEST_PLAN.md` - Plano de testes com Postman
- `DATABASE_TABLES.md` - Estrutura completa do banco de dados
- `LOCATIONIQ.md` - Detalhes da integração LocationIQ

## Testes com Postman

Um plano de testes completo está disponível em `docs/POSTMAN_TEST_PLAN.md`. Você pode importar as requisições em uma collection do Postman para testar todos os endpoints.

## Logs

A aplicação gera logs estruturados em diferentes níveis:
- `DEBUG` - Informações de debug
- `INFO` - Informações gerais
- `WARN` - Avisos
- `ERROR` - Erros

## Licença

ISC
