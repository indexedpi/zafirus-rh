import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('cases/:id/audit')
  findByCaseId(@Param('id') caseId: string) {
    return this.auditService.findByCaseId(caseId);
  }
}
