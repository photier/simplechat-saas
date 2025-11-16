import { IsString, IsInt, IsOptional, IsIn, Min, Max } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @IsIn(['en', 'tr'])
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @IsOptional()
  @IsString()
  @IsIn(['left', 'right'])
  sidebarPosition?: string;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  dataRetention?: number;
}
