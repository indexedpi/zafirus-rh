// Approve has no body — the action is implicit.
// This DTO exists for consistency and future extensions (e.g., approver name).
import { IsOptional, IsString } from 'class-validator';

export class ApproveEmailTemplateDto {
  @IsOptional()
  @IsString()
  approverName?: string;
}
