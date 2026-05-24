import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OnboardingCase } from '../cases/onboarding-case.entity';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingCase, (c) => c.emailTemplates)
  @JoinColumn({ name: 'case_id' })
  onboardingCase: OnboardingCase;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  signature: Record<string, unknown> | null;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: false })
  changedAfterApproval: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
