import { Schema, model, Model } from 'mongoose';
import { IRecentViewProd, IUser } from './user.interface';

const recentViewSchema: Schema<IRecentViewProd> = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  viewAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose schema definition
const userSchema: Schema<IUser> = new Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    date_of_birth: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: 'user'
    },
    isverified: {
      type: Boolean,
      default: false
    },
    status: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    isSocialLogin: {
      type: Boolean,
      default: false
    },
    notification: {
      type: Boolean,
      required: true,
      default: true
    },
    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    recentViews: [recentViewSchema],
  },
  {
    timestamps: true,
    _id: true
  },
);



// User model creation
export const User = model<IUser>('users', userSchema);
