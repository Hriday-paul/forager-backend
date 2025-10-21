import { Types } from "mongoose";
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { IStore } from "./store.interface";
import { Stores } from "./store.model";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import { sendNotification } from "../notification/notification.utils";

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

//get all stores
const allStores = async (query: Record<string, any>) => {
    const storeModel = new QueryBuilder(Stores.find(), query)
        .search(['name', 'address'])
        .paginate()
        .sort();
    const data: any = await storeModel.modelQuery;
    const meta = await storeModel.countTotal();
    return {
        data,
        meta,
    };
}

// approve store
const approveStoreStatus = async (storeId: string) => {
    const exist = await Stores.findById(storeId).populate("user");
    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Store not found")
    }
    const res = await Stores.updateOne({ _id: storeId }, { status: "approved" });

    const tokenToUse = exist?.user?.fcmToken

    if (tokenToUse && exist?.user?.notification) {
        sendNotification([tokenToUse], {
            title: `Your store account approved successfully ✅`,
            message: `Hello ${exist?.user?.first_name}, your requested store account approved from the FORAGER admin. You can now upload product in your store account and display products to user throw our app`,
            receiver: exist?.user?._id,
            receiverEmail: exist?.user?.email,
            receiverRole: exist?.user?.role,
            sender: exist?.user?._id,
        });
    }
    return res;
}

// reject store
const rejectStoreStatus = async (storeId: string) => {
    const exist = await Stores.findById(storeId).populate("user");;
    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Store not found")
    }
    const res = await Stores.updateOne({ _id: storeId }, { status: "rejected" });

    const tokenToUse = exist?.user?.fcmToken

    if (tokenToUse && exist?.user?.notification) {
        sendNotification([tokenToUse], {
            title: `Your store account request rejected ❌`,
            message: `Hello ${exist?.user?.first_name}, your requested store account rejected from the FORAGER admin. Please, provide valid information for approval`,
            receiver: exist?.user?._id,
            receiverEmail: exist?.user?.email,
            receiverRole: exist?.user?.role,
            sender: exist?.user?._id,
        });
    }

    return res;
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
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
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

    return res?.length > 0 ? res[0] : {};
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
    allStores,
    myStoreAccount,
    storeDetails,
    nearMeStores,
    approveStoreStatus,
    rejectStoreStatus
}