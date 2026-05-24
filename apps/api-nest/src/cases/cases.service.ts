import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { OnboardingCase } from './onboarding-case.entity';
import { CreateCaseDto, BlockCaseDto, CancelCaseDto } from './dto';
import { EmployeesService } from '../employees/employees.service';
import { AuditService } from '../audit/audit.service';
import { TasksService } from '../tasks/tasks.service';
import { CandidateSubmissionsService } from '../candidate-submissions/candidate-submissions.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';
import { SubmitCandidateDto } from '../candidate-submissions/dto/submit-candidate.dto';
import { CaseStatus, ActorType } from '../common/enums';

function generateToken(): string {
  return randomBytes(16).toString('hex');
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateCorporateEmail(first: string, last: string): string {
  const initial = removeAccents(first.charAt(0).toLowerCase());
  const surname = removeAccents(
    last.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''),
  );
  return `${initial}${surname}@zafirus.tech`;
}

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(OnboardingCase)
    private readonly caseRepo: Repository<OnboardingCase>,
    private readonly employeesService: EmployeesService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
    private readonly candidateSubmissionsService: CandidateSubmissionsService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  // ── Queries ──

  async findAll(): Promise<OnboardingCase[]> {
    return this.caseRepo.find({
      relations: { employee: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OnboardingCase> {
    const c = await this.caseRepo.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!c) throw new NotFoundException(`Case ${id} not found`);
    return c;
  }

  // ── Create ──

  async create(dto: CreateCaseDto): Promise<OnboardingCase> {
    const employee = await this.employeesService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      personalEmail: dto.personalEmail ?? null,
      documentId: dto.documentId ?? null,
      role: dto.role,
      area: dto.area,
      location: dto.location ?? null,
      startDate: dto.startDate ?? null,
      managerName: dto.managerName ?? null,
    });

    const onboardingCase = this.caseRepo.create({
      employeeId: employee.id,
      status: CaseStatus.DRAFT,
      candidateToken: generateToken(),
    });
    const saved = await this.caseRepo.save(onboardingCase);

    // Create default email template
    await this.emailTemplatesService.create(saved.id, {
      subject: '¡Bienvenida/o a Zafirus Technologies!',
      bodyHtml: '',
    });

    await this.auditService.log({
      caseId: saved.id,
      action: 'case_created',
      actorName: 'rrhh',
      category: 'case',
      details: { employeeId: employee.id },
    });

    return this.findOne(saved.id);
  }

  // ── State transitions ──

  async sendForm(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.DRAFT, 'send form');

    c.status = CaseStatus.CANDIDATE_INVITED;
    if (!c.candidateToken) {
      c.candidateToken = generateToken();
    }
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'candidate_form_sent',
      actorName: 'rrhh',
      category: 'case',
    });

    return this.findOne(id);
  }

  async submitCandidate(
    id: string,
    dto: SubmitCandidateDto,
  ): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.CANDIDATE_INVITED, 'submit candidate data');

    // Create submission record
    await this.candidateSubmissionsService.create(id, dto);

    c.status = CaseStatus.CANDIDATE_SUBMITTED;
    c.candidateSubmittedAt = new Date();
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'candidate_form_submitted',
      actorType: ActorType.USER,
      actorName: 'candidate',
      category: 'candidate',
    });

    return this.findOne(id);
  }

  async startReview(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.CANDIDATE_SUBMITTED, 'start review');

    c.status = CaseStatus.HR_REVIEW;
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'review_started',
      actorName: 'rrhh',
      category: 'case',
    });

    return this.findOne(id);
  }

  async consolidate(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.HR_REVIEW, 'consolidate');

    // Copy candidate data into employee if submission exists
    const submission =
      await this.candidateSubmissionsService.findByCaseId(id);
    if (submission) {
      await this.employeesService.update(c.employee.id, {
        taxIdValue: submission.taxIdValue,
        bankAccount: submission.bankAccount ?? submission.walletAddress,
      });
    }

    c.dataConsolidatedAt = new Date();
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'candidate_data_consolidated',
      actorName: 'rrhh',
      category: 'data',
    });

    return this.findOne(id);
  }

  async approve(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.HR_REVIEW, 'approve');

    c.status = CaseStatus.READY_TO_ACTIVATE;
    c.approvedAt = new Date();
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'case_approved',
      actorName: 'rrhh',
      category: 'case',
    });

    return this.findOne(id);
  }

  async activate(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.READY_TO_ACTIVATE, 'activate');

    // Generate corporate email
    const corpEmail = generateCorporateEmail(
      c.employee.firstName,
      c.employee.lastName,
    );
    await this.employeesService.update(c.employee.id, {
      corporateEmail: corpEmail,
    });

    c.status = CaseStatus.ACTIVATING;
    c.activatedAt = new Date();
    await this.caseRepo.save(c);

    // Create mock tasks — no real APIs called
    await this.tasksService.createActivationTasks(id);

    await this.auditService.log({
      caseId: id,
      action: 'activation_started',
      actorName: 'rrhh',
      category: 'case',
      details: { corporateEmail: corpEmail },
    });

    return this.findOne(id);
  }

  async block(id: string, dto: BlockCaseDto): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    if (
      c.status === CaseStatus.OPERATIVE ||
      c.status === CaseStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot block a case in ${c.status} status`,
      );
    }

    c.status = CaseStatus.BLOCKED;
    c.blockReason = dto.reason;
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'case_blocked',
      actorName: 'rrhh',
      category: 'case',
      details: { reason: dto.reason },
    });

    return this.findOne(id);
  }

  async unblock(id: string): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    this.assertStatus(c, CaseStatus.BLOCKED, 'unblock');

    c.status = CaseStatus.HR_REVIEW;
    c.blockReason = null;
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'case_unblocked',
      actorName: 'rrhh',
      category: 'case',
    });

    return this.findOne(id);
  }

  async cancel(id: string, dto: CancelCaseDto): Promise<OnboardingCase> {
    const c = await this.findOne(id);
    if (c.status === CaseStatus.OPERATIVE) {
      throw new BadRequestException('Cannot cancel an operative case');
    }

    c.status = CaseStatus.CANCELLED;
    c.cancelReason = dto.reason ?? null;
    await this.caseRepo.save(c);

    await this.auditService.log({
      caseId: id,
      action: 'case_cancelled',
      actorName: 'rrhh',
      category: 'case',
      details: dto.reason ? { reason: dto.reason } : undefined,
    });

    return this.findOne(id);
  }

  // ── Helpers ──

  private assertStatus(
    c: OnboardingCase,
    expected: CaseStatus,
    action: string,
  ): void {
    if (c.status !== expected) {
      throw new BadRequestException(
        `Cannot ${action}: case is in "${c.status}", expected "${expected}"`,
      );
    }
  }
}
