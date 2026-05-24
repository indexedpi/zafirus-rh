import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { CaseStatus } from '../common/enums';
import { OnboardingTask } from '../tasks/onboarding-task.entity';
import { AuditEvent } from '../audit/audit-event.entity';
import { CandidateSubmission } from '../candidate-submissions/candidate-submission.entity';
import { EmailTemplate } from '../email-templates/email-template.entity';

@Entity('onboarding_cases')
export class OnboardingCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.DRAFT,
  })
  status: CaseStatus;

  @Column({ unique: true, nullable: true })
  candidateToken: string | null;

  @Column({ type: 'text', nullable: true })
  blockReason: string | null;

  @Column({ type: 'text', nullable: true })
  cancelReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  candidateSubmittedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  dataConsolidatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @OneToMany(() => OnboardingTask, (task) => task.onboardingCase)
  tasks: OnboardingTask[];

  @OneToMany(() => AuditEvent, (event) => event.onboardingCase)
  auditLog: AuditEvent[];

  @OneToMany(() => CandidateSubmission, (sub) => sub.onboardingCase)
  candidateSubmissions: CandidateSubmission[];

  @OneToMany(() => EmailTemplate, (et) => et.onboardingCase)
  emailTemplates: EmailTemplate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
