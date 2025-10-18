import { Types } from "mongoose";
import AppError from "../../error/AppError";
import { sendNotification } from "../notification/notification.utils";
import { User } from "../user/user.models";
import { IProduct } from "./products.interface";
import { Products } from "./products.model";
import httpStatus from 'http-status'
import { ObjectId } from "mongodb"
import { IUser } from "../user/user.interface";

const addProduct = async (payload: IProduct) => {
    const { bought_reqs, could_not_find_reqs, isDeleted, ...more_fields } = payload;

    const res = await Products.create(more_fields);
    return res;
}

const allProducts = async (query: Record<string, any>, userId: string) => {
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query?.searchTerm || "";
    const category = query?.category || null;


    const filters: any = {
        title: { $regex: search, $options: "i" },
        isDeleted: false,
    };

    if (category) filters.category = category;

    const hasMin = query?.min !== undefined && query?.min !== null;
    const hasMax = query?.max !== undefined && query?.max !== null;

    if (hasMin && hasMax) {
        filters.price = { $gte: Number(query.min), $lte: Number(query.max) };
    } else if (hasMin) {
        filters.price = { $gte: Number(query.min) };
    } else if (hasMax) {
        filters.price = { $lte: Number(query.max) };
    }

    const products = await Products.aggregate([
        // 1. Match by filters
        { $match: filters },

        // 2. Lookup aggregated review data
        {
            $lookup: {
                from: "reviews",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 }
                        }
                    }
                ],
                as: "reviewStats"
            }
        },

        // 3. Add avgRating and reviewCount safely
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                },
                isCouldNotFindRequested: {
                    $in: [new ObjectId(userId), "$could_not_find_reqs"]
                },
                isBoughtRequested: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$bought_reqs",
                                    as: "req",
                                    cond: { $eq: ["$$req.user", new ObjectId(userId)] },
                                },
                            },
                        },
                        0,
                    ],
                }
            }
        },

        {
            $lookup: {
                from: "stores",
                localField: "store",
                foreignField: "_id",
                as: "store"
            }
        },
        { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "brands",
                let: { brandId: "$brand" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$brandId"] },
                                    { $eq: ["$status", "approved"] }
                                ]
                            }
                        }
                    },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "brand"
            }
        },
        {
            $addFields: {
                brand: {
                    $cond: [
                        { $gt: [{ $size: "$brand" }, 0] },
                        { $arrayElemAt: ["$brand", 0] },
                        null
                    ]
                }
            }
        },

        {
            $lookup: {
                from: "favourites",
                let: { productId: "$_id", userId: new ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$user", "$$userId"] },
                                ]
                            }
                        }
                    },
                    { $limit: 1 } // we only need to know if it exists
                ],
                as: "favouriteStatus"
            }
        },
        {
            $addFields: {
                isFavourite: { $gt: [{ $size: "$favouriteStatus" }, 0] }
            }
        },
        { $unset: "favouriteStatus" },

        // 4. Pagination
        { $skip: skip },
        { $limit: limit },
        { $sort: { isBoosted: -1 } },
    ]);

    const total = await Products.countDocuments(filters);

    const totalPage = Math.ceil(total / limit);

    const meta = {
        page,
        limit,
        total,
        totalPage,
    };

    return { data: products, meta }
}

const myProducts = async (query: Record<string, any>, userId: string) => {

    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query?.searchTerm || "";
    const category = query?.category || null;

    const filters: any = {
        title: { $regex: search, $options: "i" }, // text search
    };
    if (category) filters.category = category;

    filters.isDeleted = false;

    filters.user = new ObjectId(userId);

    const products = await Products.aggregate([
        // 1. Match by filters
        { $match: filters },

        // 2. Lookup aggregated review data
        {
            $lookup: {
                from: "reviews",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 }
                        }
                    }
                ],
                as: "reviewStats"
            }
        },

        // 3. Add avgRating and reviewCount safely
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                },
                isCouldNotFindRequested: {
                    $in: [new ObjectId(userId), "$could_not_find_reqs"],
                },
                isBoughtRequested: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$bought_reqs",
                                    as: "req",
                                    cond: { $eq: ["$$req.user", new ObjectId(userId)] },
                                },
                            },
                        },
                        0,
                    ],
                }
            }
        },

        {
            $lookup: {
                from: "brands",
                let: { brandId: "$brand" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$brandId"] },
                                    { $eq: ["$status", "approved"] }
                                ]
                            }
                        }
                    },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "brand"
            }
        },
        {
            $addFields: {
                brand: {
                    $cond: [
                        { $gt: [{ $size: "$brand" }, 0] },
                        { $arrayElemAt: ["$brand", 0] },
                        null
                    ]
                }
            }
        },

        // 4. Pagination
        { $skip: skip },
        { $limit: limit },
        { $sort: { isBoosted: -1 } },
    ]);

    const total = await Products.countDocuments(filters);

    const totalPage = Math.ceil(total / limit);

    const meta = {
        page,
        limit,
        total,
        totalPage,
    };

    return { data: products, meta }
}

const singleProduct = async (productId: string, userId: string) => {

    await Products.updateOne({ _id: productId }, { $inc: { total_views: 1 } });

    const product = await Products.aggregate([

        { $match: { _id: new ObjectId(productId), isDeleted: false } },

        {
            $lookup: {
                from: "favourites",
                let: { productId: "$_id", userId: new ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$user", "$$userId"] },
                                ]
                            }
                        }
                    },
                    { $limit: 1 } // we only need to know if it exists
                ],
                as: "favouriteStatus"
            }
        },
        {
            $addFields: {
                isFavourite: { $gt: [{ $size: "$favouriteStatus" }, 0] }
            }
        },
        { $unset: "favouriteStatus" },


        // Lookup and aggregate review data
        {
            $lookup: {
                from: "reviews",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 },
                        },
                    },
                ],
                as: "reviewStats",
            },
        },

        // Add fields
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0],
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0],
                },
                isCouldNotFindRequested: {
                    $in: [new ObjectId(userId), "$could_not_find_reqs"],
                },
                isBoughtRequested: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$bought_reqs",
                                    as: "req",
                                    cond: { $eq: ["$$req.user", new ObjectId(userId)] },
                                },
                            },
                        },
                        0,
                    ],
                }
            },
        },

        {
            $lookup: {
                from: "brands",
                let: { brandId: "$brand" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$brandId"] },
                                    { $eq: ["$status", "approved"] }
                                ]
                            }
                        }
                    },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "brand"
            }
        },
        {
            $addFields: {
                brand: {
                    $cond: [
                        { $gt: [{ $size: "$brand" }, 0] },
                        { $arrayElemAt: ["$brand", 0] },
                        null
                    ]
                }
            }
        },

        { $unset: "reviewStats" },

        { $limit: 1 },

        {
            $lookup: {
                from: "stores",
                let: { storeId: "$store" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$storeId"] }
                        }
                    },
                    {
                        $project: {
                            password: 0,
                            email: 0,
                            fcmToken: 0
                        }
                    }
                ],
                as: "store"
            }
        },
        { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } }
    ]);


    if (!product[0]) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    return product[0]
}

const storeProducts = async (query: Record<string, any>, storeId: string) => {

    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query?.searchTerm || "";
    const category = query?.category || null;
    const sub_category = query?.sub_category || null;

    const filters: any = {
        title: { $regex: search, $options: "i" }, // text search
    };

    if (category) filters.category = category;
    if (sub_category) filters.sub_category = sub_category;

    filters.isDeleted = false;

    filters.store = new ObjectId(storeId);

    const products = await Products.aggregate([
        // 1. Match by filters
        { $match: filters },

        // 2. Lookup aggregated review data
        {
            $lookup: {
                from: "reviews",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 }
                        }
                    }
                ],
                as: "reviewStats"
            }
        },

        // 3. Add avgRating and reviewCount safely
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                }
            }
        },

        {
            $lookup: {
                from: "brands",
                let: { brandId: "$brand" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$brandId"] },
                                    { $eq: ["$status", "approved"] }
                                ]
                            }
                        }
                    },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "brand"
            }
        },
        {
            $addFields: {
                brand: {
                    $cond: [
                        { $gt: [{ $size: "$brand" }, 0] },
                        { $arrayElemAt: ["$brand", 0] },
                        null
                    ]
                }
            }
        },

        // 4. Pagination
        { $skip: skip },
        { $limit: limit }
    ]);

    const total = await Products.countDocuments(filters);

    const totalPage = Math.ceil(total / limit);

    const meta = {
        page,
        limit,
        total,
        totalPage,
    };

    return { data: products, meta }
}

const getMostFavouriteProductsByStore = async (query: Record<string, any>, storeId: string) => {

    const filters: any = {
        store: new Types.ObjectId(storeId),
        isDeleted: false
    }

    const category = query?.category || null;
    const sub_category = query?.sub_category || null;

    if (category) filters.category = category;
    if (sub_category) filters.sub_category = sub_category;

    const result = await Products.aggregate([
        // Step 1: Match products for this store
        {
            $match: filters
        },

        // Step 2: Lookup favourites referencing these products
        {
            $lookup: {
                from: "favourites",
                localField: "_id",
                foreignField: "product",
                as: "favourites"
            }
        },

        // Step 3: Add favourite count
        {
            $addFields: {
                favouriteCount: { $size: "$favourites" }
            }
        },

        // Step 4: Sort by most favourited
        {
            $sort: { favouriteCount: -1 }
        },
        { $limit: 10 },

        // Step 5: Optionally remove the favourites array to clean up
        {
            $project: {
                favourites: 0
            }
        }
    ]);

    return result;
};

interface upPRod extends IProduct {
    existImages?: string[],
    // lat?: number;
    // long?: number;
}

const updateProduct = async (payload: upPRod, productId: string, newImages: string[]) => {

    if (Object.keys(payload).length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'No valid fields to update');
    }

    const isExist = await Products.findById(productId);
    if (!isExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Build updated images array
    const existingImages = payload.existImages || [];
    payload.images = [...existingImages, ...newImages];

    // Remove existImages from payload to avoid saving unknown fields
    delete payload?.existImages;
    delete (payload as any).isDeleted;
    delete (payload as any).user;


    // if (typeof payload.lat === 'number' || typeof payload.long === 'number') {


    //     const updatedLat = typeof payload.lat === 'number' ? payload.lat : currentLat;
    //     const updatedLong = typeof payload.long === 'number' ? payload.long : currentLong;

    //     payload.location = {
    //         type: 'Point',
    //         coordinates: [updatedLong, updatedLat],
    //     };

    //     // Remove lat & long from payload to avoid storing them directly
    //     delete payload.lat;
    //     delete payload.long;
    // }


    // Update the product
    const result = await Products.updateOne(
        { _id: productId },
        { $set: payload },
        { runValidators: true }
    );

    if (result.modifiedCount <= 0) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Product update failed, try again'
        );
    }

    return result;

}

const deleteProduct = async (productId: string, userId: string) => {

    const isExist = await Products.findById(productId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    //check is owner
    if (isExist?.user?.toString() !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You have not access to delete',
        );
    }

    const res = await Products.updateOne({ _id: productId }, { isDeleted: true });

    return res;
};

const sendNotificationAfterAddProduct = async (userId: string, productId: ObjectId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'User not found',
        );
    }

    // get FCM token to use
    const tokenToUse = user?.fcmToken;

    // Send notification if FCM token exists and user notification is unabled
    // for product owner
    if (tokenToUse && user?.notification) {
        sendNotification([tokenToUse], {
            title: `Listing added successfully`,
            message: `New Listing added successfully`,
            receiver: user._id,
            receiverEmail: user.email,
            receiverRole: user.role,
            sender: user._id,
        });
    }
}

interface IIProduct extends Omit<IProduct, "user"> {
    user: IUser
}

const couldNotFindReq = async (productId: string, userId: string) => {
    // check user already requested or not in the couldnot find options
    const product = await Products.findById(productId).populate("user") as unknown as IIProduct;

    if (!product) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    };

    //check length exced 4
    if (product?.could_not_find_reqs.length > 4) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Request limit excited',
        );
    }

    const exist_user = product?.could_not_find_reqs?.find(i => i.toString() == userId)
    if (exist_user) {
        throw new AppError(
            httpStatus.CONFLICT,
            "You already requested to couldn't find",
        );
    }

    const res = await Products.findOneAndUpdate(
        {
            _id: productId,
        },
        {
            $addToSet: { could_not_find_reqs: new Types.ObjectId(userId) }, // add only if not exists
        },
        { new: true }
    );

    if (res?.could_not_find_reqs.length == 4) {
        await Products.updateOne({ _id: productId }, { isDeleted: true });

        const fcmToken = product?.user?.fcmToken

        if (fcmToken) {
            sendNotification([fcmToken], {
                title: `"${product?.title}" product gets archived`,
                message: `Some people requested couldn't find, that's why your "${product?.title}" product get archived`,
                receiver: product?.user?._id,
                receiverEmail: product?.user?.email,
                receiverRole: product?.user?.role,
                sender: product?.user?._id,
            });
        }
    }

    return res;

}

const boughtReq = async (productId: string, userId: string, payload: { type: "available" | "unavailable" }) => {

    const product = await Products.findOneAndUpdate(
        {
            _id: productId,
            'bought_reqs.user': { $ne: new Types.ObjectId(userId) }
        },
        {
            $push: {
                bought_reqs: {
                    user: new Types.ObjectId(userId),
                    type: payload.type
                }
            }
        },
        { new: true }
    ).populate("user") as unknown as IIProduct;

    // If product is null, user already submitted feedback
    if (!product) {
        throw new AppError(
            httpStatus.CONFLICT,
            'You already submitted a feedback for this product',
        );
    }

    // Handle unavailable type
    if (payload.type === "unavailable") {
        await Products.updateOne(
            {
                _id: productId,
            },
            {
                $set: { isDeleted: true }
            }
        );

        const fcmToken = product?.user?.fcmToken;

        if (fcmToken) {
            await sendNotification([fcmToken], {
                title: `"${product?.title}" product gets archived`,
                message: `A user reported that "${product?.title}" is no longer available`,
                receiver: product?.user?._id,
                receiverEmail: product?.user?.email,
                receiverRole: product?.user?.role,
                sender: product?.user?._id,
            });
        }
    }

    return product;
};

const listingCount = async (userId: string) => {
    const res = await Products.countDocuments({ user: userId, isDeleted: false });
    return res;
}

export const productService = {
    addProduct,
    allProducts,
    myProducts,
    storeProducts,
    getMostFavouriteProductsByStore,
    updateProduct,
    deleteProduct,
    singleProduct,
    sendNotificationAfterAddProduct,
    couldNotFindReq,
    boughtReq,
    listingCount
}