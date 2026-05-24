import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class SubmitCandidateDto {
  @IsOptional()
  @IsString()
  taxIdType?: string;

  @IsOptional()
  @IsString()
  taxIdValue?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsObject()
  internationalBankData?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  references?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  documents?: Record<string, unknown>[];
}
