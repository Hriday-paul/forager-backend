import { ISearches } from "./searches.interface";
import Search from "./searches.model";
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { Types } from "mongoose";
import { Products } from "../products/products.model";

const addnewSearches = async (userId: string, payload: ISearches) => {
    const { categories, brands, sizes } = payload;

    const productCount = await Products.countDocuments({ user: userId, isDeleted: false });
    // const productCount = 50

    if (productCount < 10) {
        throw new AppError(
            httpStatus.FORBIDDEN, "You need to minimum 10 listing for set notification"
        )
    }

    const updateFields: Partial<ISearches> = { categories, brands, sizes };

    if (productCount < 50) {
        if (brands) {
            throw new AppError(
                httpStatus.FORBIDDEN, "You can not add brand before 50 listing"
            )
        }
        if (sizes) {
            throw new AppError(
                httpStatus.FORBIDDEN, "You can not add sizes before 50 listing"
            )
        }
    }

    if (productCount < 100) {
        if (sizes) {
            throw new AppError(
                httpStatus.FORBIDDEN, "You can not add size before 100 listing"
            )
        }
    }

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof ISearches] === undefined || updateFields[key as keyof ISearches] === null) {
            delete updateFields[key as keyof ISearches];
        }
    });

    const res = await Search.findOneAndUpdate({ user: userId }, { ...payload, user: userId }, { upsert: true, new: true });

    return res;
}

const mySearchHistory = async (userId: string) => {
    const res = await Search.findOne({ user: userId })
    return res ?? { categories: [], brands: [], sizes: [] };
}

const DeletemySearchHistory = async (searchId: string, userId: string) => {
    const exist = await Search.findOne({ _id: searchId });

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND, "Search history not found"
        )
    }

    if (exist?.user?.toString() !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN, "You are not owner of this search"
        )
    }

    const res = await Search.deleteOne({ _id: searchId })
    return res;

}

export const searchServices = {
    addnewSearches,
    mySearchHistory,
    DeletemySearchHistory
}