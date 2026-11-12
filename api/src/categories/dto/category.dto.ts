import { PartialType } from '@nestjs/mapped-types';
import { IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
