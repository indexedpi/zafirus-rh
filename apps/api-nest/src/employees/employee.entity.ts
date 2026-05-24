import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  personalEmail: string | null;

  @Column({ nullable: true })
  corporateEmail: string | null;

  @Column({ nullable: true })
  documentId: string | null;

  @Column()
  role: string;

  @Column()
  area: string;

  @Column({ nullable: true })
  location: string | null;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ nullable: true })
  managerName: string | null;

  @Column({ nullable: true })
  taxIdValue: string | null;

  @Column({ nullable: true })
  bankAccount: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
