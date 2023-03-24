import mongoose, { type Types, type Model, type Document } from 'mongoose';
const { Schema, models, model } = mongoose;

interface INotification {
  to: Types.ObjectId;
  from: Types.ObjectId;
  action: 'Like' | 'Follow';
  data?: {
    likedPost?: Types.ObjectId;
  };
}

export interface INotificationModel extends INotification, Document {}

const NotificationSchema = new Schema<INotification>(
  {
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    data: {
      likedPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    },
  },
  { timestamps: true }
);

const Notification =
  (models.Notifcation as Model<INotification>) || model('Notification', NotificationSchema);

export default Notification;
