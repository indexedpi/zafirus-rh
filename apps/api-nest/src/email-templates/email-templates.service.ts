import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './email-template.entity';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repo: Repository<EmailTemplate>,
  ) {}

  async findByCaseId(caseId: string): Promise<EmailTemplate | null> {
    return this.repo.findOne({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(caseId: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = this.repo.create({
      caseId,
      subject: data.subject ?? '¡Bienvenida/o a Zafirus Technologies!',
      bodyHtml: data.bodyHtml ?? '',
      variables: data.variables ?? null,
      signature: data.signature ?? null,
      approved: false,
      changedAfterApproval: false,
    });
    return this.repo.save(template);
  }

  async update(
    caseId: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    let template = await this.findByCaseId(caseId);
    if (!template) {
      throw new NotFoundException(`Email template for case ${caseId} not found`);
    }

    if (dto.subject !== undefined) template.subject = dto.subject;
    if (dto.bodyHtml !== undefined) template.bodyHtml = dto.bodyHtml;
    if (dto.variables !== undefined) template.variables = dto.variables;
    if (dto.signature !== undefined) template.signature = dto.signature;

    // Track changes after approval
    if (template.approved) {
      template.changedAfterApproval = true;
    }

    return this.repo.save(template);
  }

  async approve(caseId: string): Promise<EmailTemplate> {
    let template = await this.findByCaseId(caseId);
    if (!template) {
      throw new NotFoundException(`Email template for case ${caseId} not found`);
    }

    template.approved = true;
    template.changedAfterApproval = false;
    template.approvedAt = new Date();
    return this.repo.save(template);
  }
}
