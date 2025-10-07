
import { model, Model, Schema } from 'mongoose';
import { IReview } from './review.interface';


export interface reviewModel extends Model<IReview> { }

const ReviewSchema: Schema<IReview> = new Schema(
    {
        
        product_user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        store: { type: Schema.Types.ObjectId, ref: 'stores', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'products', required: true },
        reviewer: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
        isDeleted: { type: Boolean, required: true, default : false },
        isEdited: { type: Boolean, required: true, default : false },
    },
    { timestamps: true },
);

ReviewSchema.index({ product: 1, isDeleted: 1 });

export const Reviews = model<IReview, reviewModel>('reviews', ReviewSchema);