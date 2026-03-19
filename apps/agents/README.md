# Jedi Study Agent Service

Serviço de agentes inteligentes baseado em FastAPI para o projeto Jedi Study.

## Como rodar localmente com `uv`

Este projeto utiliza o [uv](https://github.com/astral-sh/uv) para gerenciamento extremamente rápido de dependências e ambientes virtuais Python.

### 1. Pré-requisitos
- Ter o `uv` instalado ([Instruções de instalação](https://github.com/astral-sh/uv#installation)).

### 2. Configurar ambiente
Entre na pasta do projeto e crie o ambiente virtual:
```bash
cd apps/agents
uv venv
```

### 3. Instalar dependências
O `uv` sincroniza as dependências do `requirements.txt`:
```bash
uv pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente
Copie o arquivo de exemplo e preencha as chaves necessárias (ex: `GOOGLE_API_KEY`):
```bash
cp .env.example .env
```

### 5. Executar o servidor
Use o `uv run` para garantir que o comando seja executado dentro do ambiente virtual:

**Modo de Desenvolvimento (com reload automático):**
```bash
uv run uvicorn main:app --reload --port 8001
```

**Modo Padrão:**
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8001
```

A API estará disponível em `http://localhost:8001`. Você pode acessar a documentação interativa em `/docs`.
