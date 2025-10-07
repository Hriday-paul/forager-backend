
import { model, Model, Schema } from 'mongoose';
import { IStore } from './store.interface';

const StoreSchema: Schema<IStore> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        name: { type: String, required: true },
        photo: { type: String, required: true },
        cover_photo: { type: String, required: true },
        address: { type: String },
        open_time: { type: String },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", required: true },
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
        }
    },
    { timestamps: true },
);

StoreSchema.index({ location: '2dsphere' });
export const Stores = model<IStore>('stores', StoreSchema);