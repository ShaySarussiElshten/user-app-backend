import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: Object,
  })
  homeLocation: {
    lat: number;
    lng: number;
  };

  @Prop({ required: true })
  city: string;
}

export const UserSchema = SchemaFactory.createForClass(User);