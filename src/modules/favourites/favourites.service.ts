import mongoose from "mongoose";
import { Favorites } from "./favourites.model";
import AppError from "../../error/AppError";
import httpstatus from "http-status"
import { Products } from "../products/products.model";


const addFavourite = async (product: string, user: string) => {

    const existProduct = await Products.findById(product);

    if (!existProduct) {
        throw new AppError(httpstatus.NOT_FOUND, "Product not found for favourite")
    }

    const exist = await Favorites.findOne({ product, user });

    if (exist) {
        throw new AppError(httpstatus.FORBIDDEN, "Product already exist to favourite")
    }

    const res = await Favorites.insertOne({ product, user });

    return res;
}

const deletefavourite = async (product: string, user: string) => {

    const exist = await Favorites.findOne({ product, user });

    if (!exist) {
        throw new AppError(httpstatus.NOT_FOUND, "Favourite product not found")
    }

    const res = await Favorites.deleteOne({ product });

    return res;
}

const getAllMyFavourites = async (user: string) => {

    const favorites = await Favorites.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(user),
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'reviews',
                let: { productId: '$product._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$isDeleted', false] },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: '$rating' },
                            reviewCount: { $sum: 1 },
                        },
                    },
                ],
                as: 'reviewStats',
            },
        },
        {
            $addFields: {
                'product.avgRating': {
                    $ifNull: [{ $arrayElemAt: ['$reviewStats.avgRating', 0] }, 0],
                },
                'product.reviewCount': {
                    $ifNull: [{ $arrayElemAt: ['$reviewStats.reviewCount', 0] }, 0],
                },
            },
        },
        {
            $project: {
                reviewStats: 0, // hide temp field
            },
        },
    ]);

    return favorites
}

export const favouriteService = {
    addFavourite,
    deletefavourite,
    getAllMyFavourites
}