import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { OnboardingCase } from '../cases/onboarding-case.entity';
import { CandidateSubmission } from '../candidate-submissions/candidate-submission.entity';
import { EmailTemplate } from '../email-templates/email-template.entity';
import { OnboardingTask } from '../tasks/onboarding-task.entity';
import { AuditEvent } from '../audit/audit-event.entity';
import { CaseStatus, TaskStatus, TaskType, ActorType } from '../common/enums';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(OnboardingCase)
    private readonly caseRepo: Repository<OnboardingCase>,
    @InjectRepository(CandidateSubmission)
    private readonly subRepo: Repository<CandidateSubmission>,
    @InjectRepository(EmailTemplate)
    private readonly emailRepo: Repository<EmailTemplate>,
    @InjectRepository(OnboardingTask)
    private readonly taskRepo: Repository<OnboardingTask>,
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
  ) {}

  async run(): Promise<{ message: string }> {
    this.logger.log('Seeding demo data...');

    // ── Employee 1: María Pérez — draft case
    const emp1 = await this.employeeRepo.save(
      this.employeeRepo.create({
        firstName: 'María',
        lastName: 'Pérez',
        personalEmail: 'maria.perez@gmail.com',
        role: 'Product Manager',
        area: 'product',
        location: 'CABA, Argentina',
        startDate: this.futureDate(14),
        managerName: 'Carlos Ruiz',
      }),
    );
    const case1 = await this.caseRepo.save(
      this.caseRepo.create({
        employeeId: emp1.id,
        status: CaseStatus.DRAFT,
        candidateToken: this.token(),
      }),
    );
    await this.audit(case1.id, 'case_created', 'rrhh');
    await this.emailRepo.save(
      this.emailRepo.create({
        caseId: case1.id,
        subject: '¡Bienvenida/o a Zafirus Technologies!',
        bodyHtml: '<p>Email de bienvenida para María Pérez</p>',
        approved: false,
      }),
    );

    // ── Employee 2: Lucas Gómez — candidate_submitted
    const emp2 = await this.employeeRepo.save(
      this.employeeRepo.create({
        firstName: 'Lucas',
        lastName: 'Gómez',
        personalEmail: 'lucas.gomez@hotmail.com',
        role: 'UX Designer',
        area: 'design',
        location: 'Santiago, Chile',
        startDate: this.futureDate(7),
        managerName: 'Ana Silva',
      }),
    );
    const case2 = await this.caseRepo.save(
      this.caseRepo.create({
        employeeId: emp2.id,
        status: CaseStatus.CANDIDATE_SUBMITTED,
        candidateToken: this.token(),
        candidateSubmittedAt: new Date(),
      }),
    );
    await this.audit(case2.id, 'case_created', 'rrhh');
    await this.audit(case2.id, 'candidate_form_sent', 'rrhh');
    await this.audit(case2.id, 'candidate_form_submitted', 'candidate', ActorType.USER);
    await this.subRepo.save(
      this.subRepo.create({
        caseId: case2.id,
        taxIdType: 'RUT',
        taxIdValue: '12.345.678-9',
        paymentMethod: 'WIRE',
        bankAccount: null,
        walletAddress: null,
        references: [
          {
            fullName: 'Carlos Mendoza',
            relationship: 'Jefe directo',
            company: 'DesignCorp',
            email: 'carlos@designcorp.com',
            phone: '+56 9 5555 1234',
          },
        ],
        rawPayload: {},
        submittedAt: new Date(),
      }),
    );

    // ── Employee 3: Juan López — ready_to_activate with tasks
    const emp3 = await this.employeeRepo.save(
      this.employeeRepo.create({
        firstName: 'Juan',
        lastName: 'López',
        personalEmail: 'juan.lopez@gmail.com',
        corporateEmail: 'jlopez@zafirus.tech',
        role: 'Backend Engineer',
        area: 'engineering',
        location: 'Rosario, Argentina',
        startDate: this.futureDate(3),
        managerName: 'Ágata Fidani',
        documentId: '34567890',
        taxIdValue: '20-34567890-1',
        bankAccount: '0070234565000000123456',
      }),
    );
    const case3 = await this.caseRepo.save(
      this.caseRepo.create({
        employeeId: emp3.id,
        status: CaseStatus.READY_TO_ACTIVATE,
        candidateToken: this.token(),
        candidateSubmittedAt: new Date(Date.now() - 86400000),
        dataConsolidatedAt: new Date(Date.now() - 3600000),
        approvedAt: new Date(),
      }),
    );
    await this.audit(case3.id, 'case_created', 'rrhh');
    await this.audit(case3.id, 'candidate_form_sent', 'rrhh');
    await this.audit(case3.id, 'candidate_form_submitted', 'candidate', ActorType.USER);
    await this.audit(case3.id, 'review_started', 'rrhh');
    await this.audit(case3.id, 'candidate_data_consolidated', 'rrhh');
    await this.audit(case3.id, 'case_approved', 'rrhh');
    await this.subRepo.save(
      this.subRepo.create({
        caseId: case3.id,
        taxIdType: 'CUIT',
        taxIdValue: '20-34567890-1',
        paymentMethod: 'CBU',
        bankAccount: '0070234565000000123456',
        references: [
          {
            fullName: 'Martín Sosa',
            relationship: 'Ex-jefe',
            company: 'TechCorp SA',
            email: 'martin.sosa@techcorp.com',
            phone: '+54 341 555-0101',
          },
        ],
        rawPayload: {},
        submittedAt: new Date(Date.now() - 86400000),
      }),
    );
    await this.emailRepo.save(
      this.emailRepo.create({
        caseId: case3.id,
        subject: '¡Bienvenida/o a Zafirus Technologies!',
        bodyHtml:
          '<h1>¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!</h1><p>Hola Juan, nos alegra mucho que te sumes al equipo.</p>',
        approved: true,
        approvedAt: new Date(),
      }),
    );

    // Create some pending tasks for case 3
    const taskTypes: { type: TaskType; label: string }[] = [
      { type: TaskType.CREATE_GOOGLE_USER, label: 'Crear usuario de Google Workspace' },
      { type: TaskType.ADD_GOOGLE_GROUPS, label: 'Agregar a grupos' },
      { type: TaskType.CONFIGURE_GMAIL_SIGNATURE, label: 'Configurar firma de Gmail' },
      { type: TaskType.SEND_WELCOME_EMAIL, label: 'Enviar email de bienvenida' },
      { type: TaskType.REQUEST_DEVICE, label: 'Solicitar equipo' },
    ];
    for (const t of taskTypes) {
      await this.taskRepo.save(
        this.taskRepo.create({
          caseId: case3.id,
          type: t.type,
          label: t.label,
          status: TaskStatus.PENDING,
        }),
      );
    }

    this.logger.log('Seed complete: 3 employees, 3 cases created');
    return { message: 'Seed complete: 3 employees, 3 cases' };
  }

  private async audit(
    caseId: string,
    action: string,
    actorName: string,
    actorType = ActorType.USER,
  ): Promise<void> {
    await this.auditRepo.save(
      this.auditRepo.create({
        caseId,
        action,
        actorType,
        actorName,
        category: 'case',
      }),
    );
  }

  private futureDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private token(): string {
    const chars = 'abcdef0123456789';
    let t = '';
    for (let i = 0; i < 32; i++) t += chars[Math.floor(Math.random() * chars.length)];
    return t;
  }
}
