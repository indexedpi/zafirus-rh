import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateSubmission } from './candidate-submission.entity';
import { SubmitCandidateDto } from './dto/submit-candidate.dto';

@Injectable()
export class CandidateSubmissionsService {
  constructor(
    @InjectRepository(CandidateSubmission)
    private readonly repo: Repository<CandidateSubmission>,
  ) {}

  async findByCaseId(caseId: string): Promise<CandidateSubmission | null> {
    return this.repo.findOne({
      where: { caseId },
      order: { submittedAt: 'DESC' },
    });
  }

  async create(
    caseId: string,
    dto: SubmitCandidateDto,
  ): Promise<CandidateSubmission> {
    const submission = this.repo.create({
      caseId,
      taxIdType: dto.taxIdType ?? null,
      taxIdValue: dto.taxIdValue ?? null,
      paymentMethod: dto.paymentMethod ?? null,
      bankAccount: dto.bankAccount ?? null,
      walletAddress: dto.walletAddress ?? null,
      internationalBankData: dto.internationalBankData ?? null,
      references: dto.references ?? null,
      documents: dto.documents ?? null,
      rawPayload: dto as Record<string, unknown>,
      submittedAt: new Date(),
    });
    return this.repo.save(submission);
  }
}
