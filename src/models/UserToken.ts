import { model, ObjectId, Schema } from 'mongoose';

export interface UserTokenInterface {
  userId: ObjectId;
  refresh_token: string;
  createdAt: Date;
}

export const UserToken = model(
  'UserToken',
  new Schema<UserTokenInterface>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      refresh_token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
    },
    {
      timestamps: true,
    }
  )
);
