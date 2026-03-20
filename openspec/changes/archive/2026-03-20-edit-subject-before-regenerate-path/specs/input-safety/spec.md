# Input Safety Specification

## Purpose
Garantir a integridade e segurança dos prompts enviados aos agentes de IA, prevenindo ataques de prompt injection.

## Scope
O que está **incluído** nessa spec:
- Detecção de ataques de prompt injection
- Verificação síncrona de segurança antes do enfileiramento de jobs
- Respostas de erro padronizadas para inputs inseguros
- **Validação de título E goals do subject**

O que está **fora do escopo**:
- Moderação de conteúdo genérica (não relacionada a injection)
- Filtros de PII (Personally Identifiable Information)

## ADDED Requirements

### Requirement: Subject Goals Validation
The system MUST validate both the subject title AND goals in the safety check before generating a study path.

#### Scenario: Safe Title and Goals
- **WHEN** user provides a valid title and goals for a subject
- **AND** both title and goals pass the safety check
- **THEN** the system proceeds with path generation

#### Scenario: Unsafe Goals
- **WHEN** user provides goals containing potential injection content
- **AND** the safety check detects unsafe content in goals
- **THEN** the system returns a 400 Bad Request error
- **AND** the error message includes the reason for rejection
- **AND** the path generation is NOT initiated