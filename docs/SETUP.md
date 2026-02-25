# Setup Completo - Restaurant Booking System

Guia completo de instalação e configuração do Sistema de Agendamento de Restaurantes.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que possui:

### Sistema Operacional
- ✅ Windows, macOS ou Linux
- ✅ Terminal/CMD com acesso ao diretório do projeto

### Software Necessário
- ✅ **Node.js** v14 ou superior
  - Download: https://nodejs.org/
  - Verificar: `node --version`
  
- ✅ **npm** (incluso no Node.js)
  - Verificar: `npm --version`
  
- ✅ **Git** (opcional, para versionamento)
  - Download: https://git-scm.com/

### Chaves de API
- ✅ **LocationIQ API Key** (gratuita)
  - Criar conta: https://locationiq.com/
  - Usar: Chave de $2 gratuita por mês

---

## 🚀 Instalação Passo a Passo

### 1️⃣ Clonar/Acessar o Projeto

```bash
# Se ainda não tiver clonado
git clone git@github.com:GabrielRozario/unit-testing-jest.git
cd unit-testing-jest

# Ou, se já tem o projeto
cd /caminho/para/unit-testing-jest
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

**Dependências que serão instaladas:**
- `express` - Framework web
- `dotenv` - Variáveis de ambiente
- `sqlite3` - Banco de dados
- `axios` - Cliente HTTP
- `swagger-jsdoc` - Documentação API
- `swagger-ui-express` - UI do Swagger
- `jest` - Testes unitários
- `supertest` - Testes HTTP

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env (copiar do template)
cp .env.example .env
```

Edite o arquivo `.env` e complete com suas informações:

```env
# Porta do servidor
PORT=3000

# Ambiente (development, production, test)
NODE_ENV=development

# Chave da API LocationIQ (obtenha em https://locationiq.com/)
LOCATION_IQ_KEY=sua_chave_aqui

# Banco de dados (opcional)
DATABASE_NAME=restaurant_booking.db
```

### 4️⃣ Verificar Instalação

```bash
# Verificar versões instaladas
node --version
npm --version

# Verificar que pode executar npm scripts
npm run
```

---

## 🎯 Executando o Projeto

### Iniciar o Servidor

```bash
npm start
```

**Saída esperada:**
```
[2026-02-23T19:00:35.655Z] [INFO] Server started successfully | {"port":"3000","environment":"development"}
[2026-02-23T19:00:35.656Z] [INFO] Successfully connected to SQLite database
[2026-02-23T19:00:35.658Z] [DEBUG] Restaurants table initialized
[2026-02-23T19:00:35.658Z] [DEBUG] Reservations table initialized
```

O servidor estará rodando em: **http://localhost:3000**

### Health Check

Verificar se o servidor está respondendo:

```bash
# Em outro terminal
curl http://localhost:3000

# Resposta esperada:
# {"message":"Restaurant Booking System"}
```

---

## 🧪 Executando Testes

### Todos os Testes

```bash
npm test
```

### Testes com Cobertura

```bash
npm run test:coverage
```

Visualizar relatório de cobertura:
```bash
# Abrir o relatório HTML
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

### Modo Watch (Reexecuta ao salvar)

```bash
npm run test:watch
```

### Resultado Esperado

```
Test Suites: 9 passed, 9 total
Tests:       219 passed, 219 total
Snapshots:   0 total
Time:        ~2s
```

---

## 📚 Acessar Documentação

### Documentação Interativa (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3000/api/docs
```

Aqui você pode:
- ✅ Explorar todos os endpoints
- ✅ Visualizar schemas de request/response
- ✅ Testar endpoints diretamente
- ✅ Copiar exemplos de requisições

### Documentação Técnica

Consulte a pasta `/doc/`:
- `DATABASE_TABLES.md` - Estrutura das tabelas
- `SETUP.md` - Este arquivo
- `POSTMAN_TEST_PLAN.md` - Plano de testes
- `LOCATIONIQ_COMPLETE.md` - Integração geolocalização
- `SOLID_PRINCIPLES_IMPLEMENTATION.md` - Padrões de design
- `SOLID_EXAMPLES.md` - Exemplos práticos
- `TESTABILITY_IMPLEMENTATION.md` - Estratégia de testes
- `CHECKLIST_INICIAL.txt` - Checklist de conclusão

### README Principal

```bash
# Abrir README
cat README.md
```

---

## 📁 Estrutura do Projeto

```
unit-testing-jest/
├── src/
│   ├── app.js                      # Configuração Express (porta de entrada)
│   ├── clients/
│   │   └── locationiq.js           # Cliente da API LocationIQ
│   ├── constants/
│   │   └── index.js                # Constantes da aplicação
│   ├── controllers/
│   │   ├── restaurantController.js # Lógica de restaurantes
│   │   └── reservationController.js # Lógica de reservas
│   ├── factories/
│   │   └── serviceFactory.js       # Factory pattern
│   ├── infra/
│   │   ├── http/
│   │   │   └── routes.js           # Definição de rotas
│   │   ├── sqlite/
│   │   │   └── database.js         # Conexão com banco
│   │   └── swagger.js              # Swagger/OpenAPI
│   ├── interfaces/
│   │   └── index.js                # Interfaces
│   ├── middlewares/
│   │   ├── restaurantValidator.js
│   │   ├── reservationValidator.js
│   │   ├── locationiqValidator.js
│   │   └── paramValidator.js
│   ├── services/
│   │   ├── restaurantService.js
│   │   ├── reservationService.js
│   │   └── locationiqService.js
│   └── utils/
│       ├── errorHandler.js         # Tratamento de erros
│       ├── logger.js               # Sistema de logs
│       ├── responseHandler.js      # Formatação de respostas
│       └── validators.js           # Validadores
├── tests/
│   ├── api.test.js
│   ├── app.test.js
│   ├── controllerHelper.test.js
│   ├── db.test.js
│   ├── errorHandler.test.js
│   ├── locationiq.test.js
│   ├── responseHandler.test.js
│   ├── services.test.js
│   └── validators.test.js
├── doc/
│   ├── SETUP.md                    # Este arquivo
│   ├── DATABASE_TABLES.md
│   ├── POSTMAN_TEST_PLAN.md
│   └── ... (outros documentos)
├── coverage/                        # Relatórios de cobertura
├── data/                            # Scripts e dados
├── .env                             # Variáveis de ambiente (não versionado)
├── .env.example                     # Template de .env
├── .gitignore
├── app.js                           # Ponto de entrada
├── jest.config.js                   # Configuração Jest
├── package.json                     # Dependências e scripts
├── package-lock.json
├── README.md                        # Documentação principal
└── restaurant_booking.db            # Banco SQLite (criado automaticamente)
```

---

## 🔧 Scripts npm Disponíveis

```bash
# Iniciar servidor
npm start

# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

---

## 📊 Variáveis de Ambiente Detalhadas

### PORT
- **Descrição**: Porta na qual o servidor rodará
- **Padrão**: 3000
- **Exemplo**: `PORT=3000`

### NODE_ENV
- **Descrição**: Ambiente de execução
- **Valores**: `development`, `production`, `test`
- **Padrão**: `development`
- **Exemplo**: `NODE_ENV=development`

### LOCATION_IQ_KEY
- **Descrição**: Chave da API LocationIQ
- **Como obter**: https://locationiq.com/
- **Obrigatório**: Sim (para funcionalidades de geolocalização)
- **Exemplo**: `LOCATION_IQ_KEY=pk_1234567890abcdef`

### DATABASE_NAME
- **Descrição**: Nome/caminho do arquivo SQLite
- **Padrão**: `restaurant_booking.db`
- **Obrigatório**: Não
- **Exemplo**: `DATABASE_NAME=restaurant_booking.db`

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'express'"

**Solução:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "LOCATION_IQ_KEY is not set"

**Solução:**
```bash
# Verificar arquivo .env existe
cat .env

# Adicionar chave LocationIQ em .env
echo "LOCATION_IQ_KEY=sua_chave" >> .env
```

### Erro: "Port 3000 is already in use"

**Solução:**
```bash
# Mudar porta em .env
PORT=3001

# Ou matar processo que usa porta 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Erro: "SQLite database connection failed"

**Solução:**
```bash
# Deletar banco de dados para recriar
rm restaurant_booking.db

# Reiniciar servidor
npm start
```

### Testes Falhando

**Solução:**
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Reinstalar dependências
npm install

# Rodar testes novamente
npm test
```

---

## ✅ Verificação Final

Após completar o setup, execute esta checklist:

- [ ] Node.js v14+ instalado: `node --version`
- [ ] npm instalado: `npm --version`
- [ ] Dependências instaladas: `npm install` (sucesso)
- [ ] Arquivo .env configurado com LOCATION_IQ_KEY
- [ ] Servidor inicia: `npm start` (sem erros)
- [ ] Health check funciona: `curl http://localhost:3000`
- [ ] Swagger acessível: `http://localhost:3000/api/docs`
- [ ] Testes passam: `npm test` (219 tests passed)

Se tudo passou ✅, seu ambiente está pronto!

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a seção "Solução de Problemas" acima
2. Verifique os arquivos de documentação em `/doc/`
3. Consulte o README.md para informações gerais
4. Verifique logs do servidor na pasta root

---

## 🎓 Próximos Passos

1. **Explorar a API**
   - Acesse `http://localhost:3000/api/docs` (Swagger)
   - Teste alguns endpoints

2. **Entender a Estrutura**
   - Leia `README.md` para visão geral
   - Explore a pasta `src/` para entender a arquitetura

3. **Rodar Testes**
   - Execute `npm test` para ver testes em ação
   - Verifique `npm run test:coverage` para cobertura

4. **Usar Postman (opcional)**
   - Consulte `doc/POSTMAN_TEST_PLAN.md`
   - Importe requests para testar offline

---

**Data**: 23 de Fevereiro de 2026
**Status**: ✅ Configuração Completa
