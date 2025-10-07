import { Types } from "mongoose";
import AppError from "../../error/AppError";
import { Products } from "../products/products.model";
import { IReview } from "./review.interface";
import { Reviews } from "./review.model";
import httpStatus from 'http-status'

const addReview = async (payload: IReview, reviewer: string) => {

    //check product is available or not ?
    const machedProduct = await Products.findOne({ _id: payload?.product })

    if (!machedProduct) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    payload.isDeleted = false
    payload.isEdited = false

    const res = await Reviews.create({ ...payload, reviewer, product_user: machedProduct?.user, store: machedProduct?.store })

    return res;
}

const reviewsByProduct = async (productId: string) => {

    const res = await Reviews.aggregate([
        {
            $match: {
                product: new Types.ObjectId(productId),
                isDeleted: false
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "reviewer",
                foreignField: "_id",
                as: "reviewer"
            }
        },
        {
            $unwind: "$reviewer"
        },
        {
            $project: {
                "reviewer.password": 0,
                "reviewer.verification": 0
            }
        },
        {
            $group: {
                _id: "$product",
                reviews: { $push: "$$ROOT" },
                avgRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 }
            }
        }
    ]);
    return res[0] ?? {reviews : [], avgRating : 0, reviewCount : 0};
}

const myProductsreviews = async (userId: string) => {

    const res = await Reviews.find({ product_user: userId, isDeleted: false }).populate("reviewer");

    return res;
}

export const reviewService = {
    addReview,
    reviewsByProduct,
    myProductsreviews
}