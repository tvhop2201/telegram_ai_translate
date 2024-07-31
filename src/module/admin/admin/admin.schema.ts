import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema({
  collection: 'admin',
  timestamps: true,
})
export class Admin {
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
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
