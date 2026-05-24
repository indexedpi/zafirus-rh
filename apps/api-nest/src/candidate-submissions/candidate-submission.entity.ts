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

@Entity('candidate_submissions')
export class CandidateSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingCase, (c) => c.candidateSubmissions)
  @JoinColumn({ name: 'case_id' })
  onboardingCase: OnboardingCase;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({ nullable: true })
  taxIdType: string | null;

  @Column({ nullable: true })
  taxIdValue: string | null;

  @Column({ nullable: true })
  paymentMethod: string | null;

  @Column({ nullable: true })
  bankAccount: string | null;

  @Column({ nullable: true })
  walletAddress: string | null;

  @Column({ type: 'jsonb', nullable: true })
  internationalBankData: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  references: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  documents: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
