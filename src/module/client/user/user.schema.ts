import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

export interface userSocialInterface {
  type: string; // facebook, telegram ,
  link: string;
}

export interface userLocationInterface {
  longitude: number | string;
  latitude: number | string;
  country: string;
  timezone: string;
  region: string;
  ip?: string;
}

@Schema({
  collection: 'user',
  timestamps: true,
})
export class User {
  @Prop({ default: true })
  status: Boolean;

  @Prop({ unique: [true, 'Duplicate email entered!'] })
  email: string;

  @Prop()
  fullName: string;

  @Prop()
  phone: string;

  @Prop()
  avatar: string;

  @Prop()
  hash: string;

  @Prop()
  social: userSocialInterface[];

  @Prop()
  lastLoginAt: Date;

  @Prop({ type: 'object' })
  location: userLocationInterface;
}

export const UserSchema = SchemaFactory.createForClass(User);
