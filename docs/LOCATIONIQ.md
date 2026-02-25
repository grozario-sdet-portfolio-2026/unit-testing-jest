# Integração LocationIQ

## 🌍 Visão Geral

A integração com LocationIQ permite:
- Buscar restaurantes próximos por coordenadas geográficas
- Geocodificação direta (endereço → coordenadas)
- Geocodificação reversa (coordenadas → endereço)

## 🔑 Configuração

1. Crie uma conta em: https://locationiq.com
2. Obtenha sua chave de API (gratuita)
3. Adicione ao `.env`:
   ```env
   LOCATION_IQ_KEY=sua_chave_aqui
   ```

## 📍 Funcionalidades

### Buscar Restaurantes Próximos

**Endpoint**: `GET /api/restaurants/nearby`

**Parâmetros**:
- `latitude` - Coordenada de latitude
- `longitude` - Coordenada de longitude
- `radiusKilometers` - Raio de busca em km

**Exemplo**:
```bash
GET /api/restaurants/nearby?latitude=-23.5505&longitude=-46.6333&radiusKilometers=5
```

### Geocodificação Direta

Converte um endereço em coordenadas (latitude/longitude).

### Geocodificação Reversa

Converte coordenadas em endereço legível.

## 🧪 Testes

Todos os testes da integração utilizam mocks para não consumir chamadas de API.

### Executar Testes

```bash
npm test -- locationiq.test.js
```

## 📚 Documentação

Para mais detalhes sobre a API LocationIQ, visite: https://locationiq.com/docs
