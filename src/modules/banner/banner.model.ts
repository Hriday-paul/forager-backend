import { model, Model, Schema } from 'mongoose';
import { IBanner } from './banner.interface';

export interface bannerModel extends Model<IBanner> { }

const BannerSchema: Schema<IBanner> = new Schema(
    {
        image: { type: String, required: true },
    },
    { timestamps: true },
);

export const Banners = model<IBanner, bannerModel>('banners', BannerSchema);