import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AdminRegisterDto {
  readonly status: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly fullName: string;

  @IsString()
  readonly password: string;

  readonly phone: string;

  readonly avatar: string;
}

export class AdminLoginDto {
  readonly email: string;

  @IsString()
  readonly password: string;
}
