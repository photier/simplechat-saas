import { IsString, MinLength } from 'class-validator';

export class SetSubdomainDto {
  @IsString()
  @MinLength(2)
  companyName: string;
}
