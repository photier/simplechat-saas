import { IsString, IsOptional, MinLength, IsObject } from 'class-validator';

export class UpdateChatbotDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsObject()
  config?: {
    mainColor?: string;
    titleOpen?: string;
    titleClosed?: string;
    introMessage?: string;
    placeholder?: string;
    desktopHeight?: number;
    desktopWidth?: number;
  };
}
