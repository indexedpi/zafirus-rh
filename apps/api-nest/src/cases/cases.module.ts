import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingCase } from './onboarding-case.entity';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { EmployeesModule } from '../employees/employees.module';
import { AuditModule } from '../audit/audit.module';
import { TasksModule } from '../tasks/tasks.module';
import { CandidateSubmissionsModule } from '../candidate-submissions/candidate-submissions.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingCase]),
    EmployeesModule,
    AuditModule,
    TasksModule,
    CandidateSubmissionsModule,
    EmailTemplatesModule,
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
