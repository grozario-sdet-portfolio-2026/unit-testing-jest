# Estratégia de Testes Unitários - Sistema de Agendamento de Restaurantes

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Organização dos Testes](#organização-dos-testes)
3. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
4. [Cobertura de Testes](#cobertura-de-testes)
5. [Estrutura AAA (Arrange-Act-Assert)](#estrutura-aaa)
6. [Tipos de Testes Implementados](#tipos-de-testes-implementados)
7. [Executar Testes](#executar-testes)
8. [Boas Práticas](#boas-práticas)
9. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

Este documento descreve a estratégia de testes unitários adotada no projeto **Sistema de Agendamento de Restaurantes**. O objetivo é garantir a qualidade do código através de testes abrangentes, bem estruturados e fáceis de manutenção.

### Ferramentas Utilizadas
- **Jest**: Framework de testes JavaScript
- **Supertest**: Teste de API HTTP
- **Mocks/Spies**: Para isolar unidades de código

### Métricas de Cobertura Esperada
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

---

## 📁 Organização dos Testes

### Estrutura de Pastas

```
project-root/
├── src/                          # Código-fonte da aplicação
│   ├── clients/                  # Integrações externas
│   ├── controllers/              # Controllers de requisições
│   ├── middlewares/              # Middlewares do Express
│   ├── services/                 # Lógica de negócio
│   ├── utils/                    # Funções utilitárias
│   ├── infra/                    # Configuração de infraestrutura
│   │   ├── sqlite/               # Banco de dados
│   │   ├── http/                 # Rotas HTTP
│   │   └── swagger.js            # Documentação
│   └── constants/                # Constantes globais
│
├── tests/                        # Testes unitários
│   └── src/                      # Espelho da estrutura src/
│       ├── clients/
│       │   └── locationiq.test.js
│       ├── controllers/
│       │   ├── reservationController.test.js
│       │   └── restaurantController.test.js
│       ├── middlewares/
│       │   ├── locationiqValidator.test.js
│       │   ├── paramValidator.test.js
│       │   ├── reservationValidator.test.js
│       │   └── restaurantValidator.test.js
│       ├── services/
│       │   ├── locationiqService.test.js
│       │   ├── reservationService.test.js
│       │   └── restaurantService.test.js
│       └── utils/
│           ├── controllerHelper.test.js
│           ├── errorHandler.test.js
│           ├── logger.test.js
│           ├── responseHandler.test.js
│           └── validators.test.js
│
├── coverage/                     # Relatórios de cobertura (gerado)
├── jest.config.js                # Configuração do Jest
└── package.json
```

### Princípio de Organização

✅ **Um arquivo de teste por módulo de source code**
- Módulo: `src/utils/validators.js` → Teste: `tests/src/utils/validators.test.js`

✅ **Espelhar a estrutura de src/ em tests/**
- Facilita localização de testes correspondentes

✅ **Nomenclatura clara e descritiva**
- Sufixo `.test.js` para todos os arquivos de teste
- Nomes descrevem o que está sendo testado

---

## 🔄 Padrões de Desenvolvimento

### 1. TDD (Test-Driven Development)

Embora nem sempre aplicado strictly, recomenda-se:
1. **Escrever o teste** que descreve o comportamento desejado
2. **Verificar falha** do teste (Red)
3. **Implementar o código** mínimo para passar (Green)
4. **Refatorar** mantendo os testes passando (Refactor)

### 2. Nomenclatura de Testes

```javascript
describe('NomeDaFuncao', () => {
  describe('quando é chamada com parâmetros válidos', () => {
    test('deve retornar o resultado esperado', () => {
      // teste
    })
  })

  describe('quando é chamada com parâmetros inválidos', () => {
    test('deve lançar um erro específico', () => {
      // teste
    })
  })
})
```

### 3. Estrutura de Suite de Testes

```javascript
describe('Unidade de Teste Principal', () => {
  // Setup e teardown
  beforeEach(() => {
    // Preparar dados antes de cada teste
  })

  afterEach(() => {
    // Limpar dados após cada teste
  })

  // Grupo de testes relacionados
  describe('Comportamento 1', () => {
    test('cenário 1', () => {})
    test('cenário 2', () => {})
  })

  // Outro grupo de testes
  describe('Comportamento 2', () => {
    test('cenário 3', () => {})
  })
})
```

---

## 📊 Cobertura de Testes

### Definição de Cobertura

| Métrica | Descrição | Meta |
|---------|-----------|------|
| **Lines** | Porcentagem de linhas executadas | 90% |
| **Statements** | Porcentagem de statements executadas | 90% |
| **Branches** | Porcentagem de caminhos condicionais (if/else) | 90% |
| **Functions** | Porcentagem de funções chamadas | 90% |

### Configuração no Jest

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### Como Garantir Cobertura

#### 1. Testar Caminhos de Sucesso
```javascript
test('deve validar número válido', () => {
  expect(() => {
    validator.validateNumberInRange(45, -90, 90, 'Latitude')
  }).not.toThrow()
})
```

#### 2. Testar Caminhos de Erro
```javascript
test('deve lançar erro para número fora do intervalo', () => {
  expect(() => {
    validator.validateNumberInRange(95, -90, 90, 'Latitude')
  }).toThrow('Latitude must be between -90 and 90')
})
```

#### 3. Testar Branches (if/else)
```javascript
describe('validateString', () => {
  test('deve aceitar string válida', () => {
    expect(() => {
      validator.validateString('João', 'Name')
    }).not.toThrow()
  })

  test('deve rejeitar string vazia', () => {
    expect(() => {
      validator.validateString('', 'Name')
    }).toThrow('Name cannot be empty')
  })

  test('deve rejeitar valor não-string', () => {
    expect(() => {
      validator.validateString(123, 'Name')
    }).toThrow('Name must be a string')
  })
})
```

---

## 🏗️ Estrutura AAA (Arrange-Act-Assert)

O padrão **Arrange-Act-Assert** estrutura cada teste em três seções:

### Arrange (Preparar)
Configurar dados, mocks e pré-condições necessários.

### Act (Agir)
Executar a função/método que está sendo testado.

### Assert (Verificar)
Verificar se o resultado é o esperado.

### Exemplo Prático

```javascript
describe('calculateDistance', () => {
  it('should calculate distance between two coordinates correctly', () => {
    // ARRANGE - Preparar dados
    const startLatitude = -23.5505
    const startLongitude = -46.6333
    const endLatitude = -22.9068
    const endLongitude = -43.1729

    // ACT - Executar
    const distance = locationiqService.calculateDistance(
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude
    )

    // ASSERT - Verificar
    expect(distance).toBeGreaterThan(350)
    expect(distance).toBeLessThan(370)
    expect(typeof distance).toBe('number')
  })
})
```

---

## 🧪 Tipos de Testes Implementados

### 1. Testes de Validação
Testam funções de validação de entrada de dados.

**Localização**: `tests/src/utils/validators.test.js`

**Exemplo**:
```javascript
describe('validateNumberInRange', () => {
  test.each([
    { value: 0, min: -90, max: 90 },
    { value: -90, min: -90, max: 90 }
  ])('deve aceitar $value', ({ value, min, max }) => {
    expect(() => {
      validators.validateNumberInRange(value, min, max, 'TestField')
    }).not.toThrow()
  })
})
```

**O que testar**:
- ✅ Valores válidos
- ✅ Valores inválidos
- ✅ Edge cases (limites, valores extremos)
- ✅ Tipos incorretos
- ✅ Valores nulos/undefined

---

### 2. Testes de Services (Lógica de Negócio)
Testam a lógica de negócio isoladamente.

**Localização**: `tests/src/services/`

**Exemplo**:
```javascript
describe('LocationIQ Service', () => {
  describe('calculateDistance', () => {
    it('should return 0 when coordinates are the same', () => {
      const distance = locationiqService.calculateDistance(45.5, -122.68, 45.5, -122.68)
      expect(distance).toBe(0)
    })
  })
})
```

**O que testar**:
- ✅ Cálculos e transformações de dados
- ✅ Fluxos de lógica condicional
- ✅ Integração com bases de dados (mockadas)
- ✅ Tratamento de erros

---

### 3. Testes de Controllers
Testam os handlers de requisições HTTP.

**Localização**: `tests/src/controllers/`

**Exemplo**:
```javascript
describe('RestaurantController', () => {
  it('should return 201 and restaurant data on success', async () => {
    const req = { body: validRestaurantData }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    await restaurantController.create(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }))
  })
})
```

**O que testar**:
- ✅ Status codes corretos
- ✅ Formato de resposta
- ✅ Chamadas a services
- ✅ Tratamento de erros

---

### 4. Testes de Middlewares
Testam middlewares de validação e processamento.

**Localização**: `tests/src/middlewares/`

**Exemplo**:
```javascript
describe('paramValidator', () => {
  it('should call next() when parameters are valid', () => {
    const req = { query: { latitude: '40.7128', longitude: '-74.0060' } }
    const res = {}
    const next = jest.fn()

    paramValidator(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
```

**O que testar**:
- ✅ Validação de parâmetros
- ✅ Chamada do `next()`
- ✅ Envio de erros correto
- ✅ Transformação de dados

---

### 5. Testes com Parametrização (test.each)
Testam múltiplos casos em um único teste.

**Exemplo**:
```javascript
describe('validateNumberInRange', () => {
  test.each([
    { value: 0, min: -90, max: 90, shouldPass: true },
    { value: -91, min: -90, max: 90, shouldPass: false },
    { value: 91, min: -90, max: 90, shouldPass: false }
  ])('value: $value, min: $min, max: $max', ({ value, min, max, shouldPass }) => {
    if (shouldPass) {
      expect(() => {
        validators.validateNumberInRange(value, min, max, 'Test')
      }).not.toThrow()
    } else {
      expect(() => {
        validators.validateNumberInRange(value, min, max, 'Test')
      }).toThrow()
    }
  })
})
```

**Benefícios**:
- ✅ Reduz duplicação de código
- ✅ Testa múltiplos cenários mantendo DRY
- ✅ Melhor legibilidade dos relatórios
- ✅ Fácil adicionar novos casos

---

### 6. Testes com Mocks e Spies
Isolam o código testado de dependências externas.

**Exemplo - Mock de função**:
```javascript
describe('reservationService', () => {
  it('should call database.create with correct parameters', async () => {
    const mockDatabase = {
      create: jest.fn().mockResolvedValue({ id: 1 })
    }

    const result = await reservationService.create(validData, mockDatabase)

    expect(mockDatabase.create).toHaveBeenCalledWith(expect.objectContaining({
      customer_name: 'John Doe'
    }))
    expect(result.id).toBe(1)
  })
})
```

**Exemplo - Spy em função existente**:
```javascript
it('should call logger.error when database fails', async () => {
  jest.spyOn(logger, 'error')
  jest.spyOn(database, 'create').mockRejectedValue(new Error('DB Error'))

  await expect(reservationService.create(data)).rejects.toThrow()

  expect(logger.error).toHaveBeenCalled()
})
```

---

## 🚀 Executar Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar testes de um arquivo específico
npm test -- tests/src/utils/validators.test.js

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="validateNumberInRange"

# Executar testes com output detalhado
npm test -- --verbose
```

### Verificar Cobertura

```bash
npm run test:coverage
```

Isso gera um relatório em `coverage/lcov-report/index.html` que pode ser aberto no navegador.

### Limpar Cache do Jest

```bash
npm test -- --clearCache
```

---

## ✨ Boas Práticas

### 1. Isolamento
- ✅ Cada teste deve ser independente
- ✅ Use `beforeEach()` e `afterEach()` para setup/cleanup
- ✅ Não compartilhe estado entre testes

❌ **Ruim**:
```javascript
let user;
describe('User', () => {
  test('should create user', () => {
    user = createUser('John') // Compartilha estado
  })
  test('should use created user', () => {
    expect(user.name).toBe('John')
  })
})
```

✅ **Bom**:
```javascript
describe('User', () => {
  let user;
  beforeEach(() => {
    user = createUser('John') // Setup em cada teste
  })
  test('should create user', () => {
    expect(user.name).toBe('John')
  })
})
```

---

### 2. Nomenclatura Clara
- ✅ Descreva o que está sendo testado
- ✅ Descreva o comportamento esperado
- ✅ Use linguagem natural

✅ **Bom**:
```javascript
test('should throw error when latitude is greater than 90', () => {})
test('should return formatted date when valid input is provided', () => {})
```

❌ **Ruim**:
```javascript
test('test latitude', () => {})
test('date function', () => {})
```

---

### 3. Testes Simples e Focados
- ✅ Um conceito por teste
- ✅ Evite lógica complexa nos testes
- ✅ Mantenha testes curtos

❌ **Ruim** (testa múltiplos conceitos):
```javascript
test('should validate and create user if valid, or log error if invalid', () => {
  if (isValid(data)) {
    const user = create(data)
    expect(user).toBeDefined()
    expect(logger.info).toHaveBeenCalled()
  } else {
    expect(logger.error).toHaveBeenCalled()
  }
})
```

✅ **Bom** (testes separados):
```javascript
test('should create user when data is valid', () => {
  const user = create(validData)
  expect(user).toBeDefined()
})

test('should log error when data is invalid', () => {
  create(invalidData)
  expect(logger.error).toHaveBeenCalled()
})
```

---

### 4. Use describe() para Agrupar Relacionados
- ✅ Organize testes por comportamento
- ✅ Aninha suites para melhor hierarchia
- ✅ Facilita leitura e manutenção

```javascript
describe('Validators', () => {
  describe('validateNumberInRange', () => {
    describe('valid cases', () => {
      test('should accept 0', () => {})
      test('should accept -90', () => {})
    })
    describe('invalid cases', () => {
      test('should reject 91', () => {})
    })
  })
  
  describe('validateString', () => {
    test('should accept non-empty string', () => {})
  })
})
```

---

### 5. Mocks e Spies Apropriados
- ✅ Mock dependências externas
- ✅ Spy em chamadas críticas
- ✅ Restaure estado após cada teste

```javascript
describe('reservationService', () => {
  let mockDatabase;
  
  beforeEach(() => {
    mockDatabase = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1, updated: true })
    }
  })

  it('should create reservation', async () => {
    const result = await reservationService.create(data, mockDatabase)
    expect(mockDatabase.create).toHaveBeenCalled()
  })
})
```

---

### 6. Assertions Significativas
- ✅ Use matchers apropriados
- ✅ Teste o que importa
- ✅ Evite assertions redundantes

✅ **Bom**:
```javascript
expect(response).toEqual(expected)
expect(error).toMatch(/latitude/)
expect(array).toHaveLength(3)
expect(obj).toHaveProperty('id')
```

❌ **Ruim**:
```javascript
expect(response !== null).toBe(true) // Use toEqual() em vez disso
expect(typeof error).toBe('object') // Muito vago
expect(array.length).toBe(3) // Use toHaveLength()
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Teste de Validação Simples

```javascript
// src/utils/validators.js
function validatePositiveNumber(value, fieldName) {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number`)
  }
  if (value <= 0) {
    throw new Error(`${fieldName} must be positive`)
  }
}

// tests/src/utils/validators.test.js
describe('validatePositiveNumber', () => {
  describe('valid cases', () => {
    test.each([1, 5, 100, 99.99])(
      'should accept positive number %s',
      (value) => {
        expect(() => {
          validators.validatePositiveNumber(value, 'Quantity')
        }).not.toThrow()
      }
    )
  })

  describe('invalid cases', () => {
    test.each([0, -1, -100])(
      'should reject non-positive number %s',
      (value) => {
        expect(() => {
          validators.validatePositiveNumber(value, 'Quantity')
        }).toThrow('Quantity must be positive')
      }
    )

    test('should reject non-number values', () => {
      expect(() => {
        validators.validatePositiveNumber('100', 'Quantity')
      }).toThrow('Quantity must be a number')
    })
  })
})
```

---

### Exemplo 2: Teste de Service com Mock

```javascript
// src/services/reservationService.js
function createReservation(data, database) {
  validateReservationData(data)
  return database.create('reservations', data)
}

// tests/src/services/reservationService.test.js
describe('ReservationService', () => {
  describe('createReservation', () => {
    it('should create reservation with valid data', async () => {
      // ARRANGE
      const mockDatabase = {
        create: jest.fn().mockResolvedValue({
          id: 1,
          customer_name: 'John Doe',
          number_of_people: 4
        })
      }
      const data = {
        customer_name: 'John Doe',
        number_of_people: 4,
        reservation_date: '2026-12-25'
      }

      // ACT
      const result = await reservationService.createReservation(data, mockDatabase)

      // ASSERT
      expect(mockDatabase.create).toHaveBeenCalledWith('reservations', data)
      expect(result).toHaveProperty('id', 1)
      expect(result.customer_name).toBe('John Doe')
    })

    it('should throw error when data is invalid', async () => {
      const mockDatabase = { create: jest.fn() }
      const invalidData = { customer_name: '', number_of_people: 0 }

      expect(() => {
        reservationService.createReservation(invalidData, mockDatabase)
      }).toThrow()
      
      expect(mockDatabase.create).not.toHaveBeenCalled()
    })
  })
})
```

---

### Exemplo 3: Teste de Controller com Express

```javascript
// tests/src/controllers/restaurantController.test.js
describe('RestaurantController', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {
      body: {}
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    mockNext = jest.fn()
  })

  describe('create', () => {
    it('should return 201 with restaurant data on success', async () => {
      // ARRANGE
      mockRequest.body = {
        name: 'Pizza Place',
        address: '123 Main St',
        latitude: 40.7128,
        longitude: -74.0060,
        capacity: 50
      }
      jest.spyOn(restaurantService, 'create')
        .mockResolvedValue({ id: 1, ...mockRequest.body })

      // ACT
      await restaurantController.create(mockRequest, mockResponse)

      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ name: 'Pizza Place' })
        })
      )
    })

    it('should return 400 when validation fails', async () => {
      mockRequest.body = { name: '' } // Invalid

      await restaurantController.create(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })
  })
})
```

---

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Unit Testing Patterns](https://www.martinfowler.com/articles/testCost.html)

---

**Versão**: 1.0  
**Data de Criação**: 25 de fevereiro de 2026  
**Status**: Ativo
