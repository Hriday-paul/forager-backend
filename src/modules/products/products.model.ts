import { model, ObjectId, Schema } from 'mongoose';
import { IProduct } from './products.interface';

const bought_req_schema: Schema<{ user: ObjectId, type: "available" | "unavailable" }> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    type: {
        type: String,
        required: true,
        enum: ["available", "unavailable"]
    }
})

const ProductSchema: Schema<IProduct> = new Schema(
    {
        title: { type: String, required: true },
        images: { type: [String], required: true },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        details: { type: String },
        sizes: { type: [String] },
        colors: { type: [String] },
        // location: {
        //     type: {
        //         type: String,
        //         enum: ['Point'],
        //         required: true,
        //         default: 'Point',
        //     },
        //     coordinates: {
        //         type: [Number], // [longitude, latitude]
        //         required: true,
        //     },
        // },
        category: { type: String, enum: ["womens_clothes", "mens_clothes", "health/beauty", "purses", "accessories"], required: true },
        sub_category: { type: String },
        brand: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },

        user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        store: { type: Schema.Types.ObjectId, ref: 'stores', required: true },

        could_not_find_reqs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'users',
                validate: [(v: string[]) => (v.length <= 4), "could_not_find_reqs exceeds the limit of 4"]
            }
        ],
        bought_reqs: [bought_req_schema],

    },
    { timestamps: true },
);

export const Products = model<IProduct>('products', ProductSchema);