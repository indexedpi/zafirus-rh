import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateSubmission } from './candidate-submission.entity';
import { CandidateSubmissionsService } from './candidate-submissions.service';
import { CandidateSubmissionsController } from './candidate-submissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateSubmission])],
  controllers: [CandidateSubmissionsController],
  providers: [CandidateSubmissionsService],
  exports: [CandidateSubmissionsService],
})
export class CandidateSubmissionsModule {}
