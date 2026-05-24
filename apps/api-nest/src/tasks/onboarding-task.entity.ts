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
import { TaskStatus, TaskType } from '../common/enums';

@Entity('onboarding_tasks')
export class OnboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingCase, (c) => c.tasks)
  @JoinColumn({ name: 'case_id' })
  onboardingCase: OnboardingCase;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  type: TaskType;

  @Column()
  label: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  failedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
