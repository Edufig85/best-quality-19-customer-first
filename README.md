# Ranking BQ19

Sistema de ranking por categoria, baseado na planilha **Resultados**.

## Funcionalidades
- Importação de Excel
- Cálculo automático de pontuação
- Ranking por cargo
- Pódio visual Top 5
- CPF não exibido

## Endpoints
- POST /import-ranking
- GET /categorias
- GET /ranking/:cargo

## Stack
- Node.js + Express
- PostgreSQL (Render)
- HTML + JS puro (frontend)
