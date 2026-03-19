from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_api_key: str = ""
    gemini_model: str = "gemini-1.5-pro"
    api_origin: str = "http://localhost:3000"

    # Gemini pricing per 1M tokens (USD) — update as pricing changes
    # https://ai.google.dev/pricing
    gemini_input_price_per_1m: float = 3.50
    gemini_output_price_per_1m: float = 10.50

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
