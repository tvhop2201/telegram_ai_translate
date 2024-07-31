import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { userLocationInterface, userSocialInterface } from './user.schema';

export class UserRegisterDto {
  readonly status: string;

  @IsString()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly fullName: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  readonly phone: string;

  readonly avatar: string;

  readonly social: userSocialInterface;

  @IsOptional()
  referrer: string;

  @IsOptional()
  location?: userLocationInterface;
}

export class UserLoginDto {
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  location?: userLocationInterface;
}
