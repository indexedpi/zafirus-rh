import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class CreateCaseDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsString()
  role: string;

  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  managerName?: string;
}
