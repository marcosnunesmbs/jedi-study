# Jedi Study ⚡

Jedi Study is an AI-powered personalized learning platform that generates custom study paths, educational content, and provides automated analysis of student tasks. It uses a multi-agent architecture powered by Google's Gemini 1.5 Pro to guide users through any subject from beginner to advanced levels.

## 🚀 Features

- **Personalized Study Paths**: Generate structured learning journeys based on your specific goals and skill level.
- **AI Content Generation**: Instant generation of:
  - Conceptual Explanations
  - Practical Examples
  - Concise Summaries
  - Curated Resource Lists
- **"Ask AI" Custom Prompts**: Request specific clarifications or analogies for any learning phase.
- **Automated Task Analysis**: Submit your answers or project descriptions and receive:
  - Numerical Score (0-100)
  - Detailed Feedback
  - Strengths and Areas for Improvement
- **Token & Cost Monitoring**: Real-time dashboard to track API consumption and estimated costs based on your `.env` configuration.
- **Modern Light Interface**: Clean, minimal, and focused user experience.

## 🏗️ Architecture

The project is built as a monorepo with three main services:

1.  **Web (Frontend)**: React 18, TypeScript, TanStack Query, Zustand, and React Markdown.
2.  **API (Backend)**: NestJS, Prisma ORM, MySQL, and Bull MQ for background processing.
3.  **Agents (AI Layer)**: Python 3.11, FastAPI, and Google Generative AI (Gemini).
4.  **Infrastructure**: Redis (as a message broker for Bull) and MySQL 8.0.

## 🛠️ Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd jedi-study
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Fill in your `GOOGLE_API_KEY` and adjust other settings if necessary.

3.  **Run with Docker Compose**:
    ```bash
    docker compose up -d
    ```

4.  **Initialize the Database**:
    Run the Prisma migrations to set up the MySQL schema:
    ```bash
    docker compose exec api npx prisma db push
    ```

5.  **Access the Application**:
    - **Frontend**: [http://localhost:5177](http://localhost:5177)
    - **API**: [http://localhost:3001](http://localhost:3001)
    - **Agents**: [http://localhost:8000](http://localhost:8000)

## 📊 Monitoring Costs

The project includes a specialized panel to monitor token consumption. You can configure the costs per 1 million tokens in your `.env`:

```env
GEMINI_COST_INPUT_1M=3.50
GEMINI_COST_OUTPUT_1M=10.50
```

Access the **Token Usage** section in the sidebar to view real-time statistics and historical data.

## 📜 License

This project is for educational purposes. Feel free to use and modify it.
