
import { model, Model, Schema } from 'mongoose';
import { IBrand } from './brands.interface';

const BrandSchema: Schema<IBrand> = new Schema(
    {
        name: { type: String, required: true },
        req_user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
    },
    { timestamps: true },
);

export const Brand = model<IBrand>('brands', BrandSchema);