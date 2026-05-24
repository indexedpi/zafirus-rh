import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { OnboardingCase } from '../cases/onboarding-case.entity';
import { ActorType } from '../common/enums';

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingCase, (c) => c.auditLog)
  @JoinColumn({ name: 'case_id' })
  onboardingCase: OnboardingCase;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({
    type: 'enum',
    enum: ActorType,
    default: ActorType.USER,
  })
  actorType: ActorType;

  @Column({ nullable: true })
  actorName: string | null;

  @Column()
  action: string;

  @Column({ nullable: true })
  category: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
