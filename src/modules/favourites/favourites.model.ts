import { model, Schema } from 'mongoose';
import { IFavourites } from './favourites.interface';


const FavouriteSchema: Schema<IFavourites> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, required: true, ref : "users" },
        product: { type: Schema.Types.ObjectId, required: true, ref : "products" },
    },
    { timestamps: true },
);

export const Favorites = model<IFavourites>('favourites', FavouriteSchema);