import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { CasesModule } from './cases/cases.module';
import { CandidateSubmissionsModule } from './candidate-submissions/candidate-submissions.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { SeedModule } from './database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    EmployeesModule,
    CasesModule,
    CandidateSubmissionsModule,
    EmailTemplatesModule,
    TasksModule,
    AuditModule,
    SeedModule,
  ],
})
export class AppModule {}
