import {
  Controller, Post, Get, Param, Body, Res, Sse, MessageEvent,
} from '@nestjs/common';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ContentService } from './content.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class GenerateContentDto {
  @IsOptional()
  @IsEnum(['EXPLANATION', 'EXAMPLE', 'SUMMARY', 'RESOURCE_LIST', 'CUSTOM'])
  contentType?: string;

  @IsOptional()
  @IsString()
  customPrompt?: string;
}

@Controller()
export class ContentController {
  constructor(
    private readonly content: ContentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('phases/:phaseId/content/generate')
  generate(
    @Param('phaseId') phaseId: string,
    @Body() dto: GenerateContentDto,
    @CurrentUser() user: any
  ) {
    return this.content.generateForPhase(phaseId, dto.contentType, dto.customPrompt, user.id);
  }

  @Get('content/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.content.findOne(id, user.id);
  }

  // SSE endpoint — polls DB until content is COMPLETE
  @Get('content/:id/stream')
  async streamContent(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: any) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Pre-check authorization before polling
      await this.content.findOne(id, user.id);
    } catch (e) {
      send('error', { message: 'Unauthorized or not found' });
      res.end();
      return;
    }

    send('status', { status: 'connecting' });

    // Poll DB for completion
    const poll = setInterval(async () => {
      const content = await this.prisma.content.findUnique({ where: { id } });
      if (!content) {
        send('error', { message: 'Content not found' });
        clearInterval(poll);
        res.end();
        return;
      }

      if (content.status === 'COMPLETE') {
        send('content', { body: content.body });
        send('done', { status: 'complete' });
        clearInterval(poll);
        res.end();
      } else if (content.status === 'ERROR') {
        send('error', { message: 'Content generation failed' });
        clearInterval(poll);
        res.end();
      } else {
        send('status', { status: content.status });
      }
    }, 1500);

    // Clean up if client disconnects
    res.on('close', () => clearInterval(poll));
  }
}
