import { Types } from "mongoose";
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { IStore } from "./store.interface";
import { Stores } from "./store.model";
import httpStatus from "http-status";

const createStore = async (payload: IStore, userId: string) => {

    const { user, status, ...more_payloads } = payload

    // check exist a store a ccount or not with this user
    const exist = await Stores.findOne({ user: userId });

    if (exist) {
        throw new AppError(
            httpStatus.CONFLICT,
            'A store already exist',
        );
    }

    const store = await Stores.create({ ...more_payloads, user: userId })

    return store;
}

const myStoreAccount = async (userId: string) => {

    const res = await Stores.aggregate([
        { $match: { user: new Types.ObjectId(userId), status: "approved" } },
        {
            $lookup: {
                from: "reviews",
                let: { storeId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$store", "$$storeId"] },
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
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                },
            }
        },
    ]);

    if (!res) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'You do not have an approved store account.',
        );
    }

    return res;
}

const storeDetails = async (storeId: string) => {

    const res = await Stores.aggregate([
        { $match: { _id: new Types.ObjectId(storeId), status: "approved" } },
        {
            $lookup: {
                from: "reviews",
                let: { storeId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$store", "$$storeId"] },
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
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                },
            }
        },
    ]);

    return res;
}


const nearMeStores = async (userId: string) => {
    const user = await User.findOne({ _id: userId });

    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'User not found',
        );
    }

    if (user?.location?.coordinates?.length < 2) {
        return [];
    }

    const userLocation: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: user?.location?.coordinates as [number, number], // [longitude, latitude]
    };

    const stores = await Stores.aggregate([
        {
            $geoNear: {
                near: userLocation,
                distanceField: "distance",
                maxDistance: 50000,   // optional: 50km radius (in meters)
                spherical: true,
                query: { status: "approved" }
            }
        },
        {
            $lookup: {
                from: "reviews",
                let: { storeId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$store", "$$storeId"] },
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
        {
            $addFields: {
                avgRating: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0]
                },
                reviewCount: {
                    $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0]
                },
            }
        },
        {
            $sort: { distance: 1 }
        }

    ]);

    return stores;
}

export const storeService = {
    createStore,
    myStoreAccount,
    storeDetails,
    nearMeStores
}