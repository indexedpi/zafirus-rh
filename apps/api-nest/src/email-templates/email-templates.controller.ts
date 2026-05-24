import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Controller()
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @Get('cases/:id/email-template')
  findByCaseId(@Param('id') caseId: string) {
    return this.service.findByCaseId(caseId);
  }

  @Patch('cases/:id/email-template')
  update(
    @Param('id') caseId: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return this.service.update(caseId, dto);
  }

  @Post('cases/:id/email-template/approve')
  approve(@Param('id') caseId: string) {
    return this.service.approve(caseId);
  }
}
