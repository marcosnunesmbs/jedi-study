import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { AgentResponse } from '@jedi-study/shared';
import type { StudyPathOutput } from '@jedi-study/shared';
import type { TaskAnalysisOutput } from '@jedi-study/shared';
import type { ProjectAnalysisOutput } from '@jedi-study/shared';

export interface GeneratePathPayload {
  subjectTitle: string;
  skillLevel: string;
  goals: string[];
  userContext?: string;
}

export interface GenerateContentPayload {
  phaseTitle: string;
  phaseObjectives: string[];
  taskContext?: string;
  contentType: string;
  customPrompt?: string;
}

export interface AnalyzeTaskPayload {
  taskTitle: string;
  taskDescription: string;
  taskType: string;
  submissionContent: string;
  projectContext?: Record<string, unknown>;
}

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(private readonly http: HttpService) {}

  async generatePath(
    payload: GeneratePathPayload,
  ): Promise<AgentResponse<StudyPathOutput>> {
    const { data } = await firstValueFrom(
      this.http.post<AgentResponse<StudyPathOutput>>(
        '/agents/path-generator',
        payload,
      ),
    );
    return data;
  }

  async generateContent(
    payload: GenerateContentPayload,
  ): Promise<AgentResponse<string>> {
    const { data } = await firstValueFrom(
      this.http.post<AgentResponse<string>>(
        '/agents/content-gen',
        payload,
      ),
    );
    return data;
  }

  async analyzeTask(
    payload: AnalyzeTaskPayload,
  ): Promise<AgentResponse<TaskAnalysisOutput | ProjectAnalysisOutput>> {
    const endpoint =
      payload.taskType === 'PROJECT'
        ? '/agents/project-analyzer'
        : '/agents/task-analyzer';

    const { data } = await firstValueFrom(
      this.http.post<AgentResponse<TaskAnalysisOutput | ProjectAnalysisOutput>>(
        endpoint,
        payload,
      ),
    );
    return data;
  }
}
