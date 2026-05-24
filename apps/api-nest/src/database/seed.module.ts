import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Employee } from '../employees/employee.entity';
import { OnboardingCase } from '../cases/onboarding-case.entity';
import { CandidateSubmission } from '../candidate-submissions/candidate-submission.entity';
import { EmailTemplate } from '../email-templates/email-template.entity';
import { OnboardingTask } from '../tasks/onboarding-task.entity';
import { AuditEvent } from '../audit/audit-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      OnboardingCase,
      CandidateSubmission,
      EmailTemplate,
      OnboardingTask,
      AuditEvent,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
