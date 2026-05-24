import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './audit-event.entity';
import { ActorType } from '../common/enums';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly repo: Repository<AuditEvent>,
  ) {}

  async log(params: {
    caseId: string;
    action: string;
    actorType?: ActorType;
    actorName?: string;
    category?: string;
    details?: Record<string, unknown>;
  }): Promise<AuditEvent> {
    // Strip sensitive values from details before persisting
    const safeDetails = params.details
      ? this.redactSensitive(params.details)
      : null;

    const event = this.repo.create({
      caseId: params.caseId,
      action: params.action,
      actorType: params.actorType ?? ActorType.USER,
      actorName: params.actorName ?? null,
      category: params.category ?? null,
      details: safeDetails,
    });
    return this.repo.save(event);
  }

  async findByCaseId(caseId: string): Promise<AuditEvent[]> {
    return this.repo.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  private redactSensitive(
    details: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveKeys = new Set([
      'password',
      'temporaryPassword',
      'token',
      'candidateToken',
      'secret',
      'apiKey',
      'cbu',
      'walletAddress',
      'taxIdValue',
      'bankAccount',
    ]);
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details)) {
      result[key] = sensitiveKeys.has(key) ? '[REDACTED]' : value;
    }
    return result;
  }
}
