import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IBrand } from "./brands.interface";
import { Brand } from "./brands.model";
import httpStatus from "http-status"

const AddBrand = async (payload: IBrand, userId: string) => {
    //check already exist
    const exist = await Brand.find({ name: { $regex: name, $options: "i" }, status: "approved" })
    if (exist) {
        throw new AppError(httpStatus.CONFLICT, "Brand already exist based on name")
    }
    const res = await Brand.insertOne({ name: payload?.name, req_user: userId, status: "pending" });
    return res;
}

const AddBrandByAdmin = async (payload: IBrand, userId: string) => {
    //check already exist
    const exist = await Brand.find({ name: { $regex: name, $options: "i" }, status: "approved" })
    if (exist) {
        throw new AppError(httpStatus.CONFLICT, "Brand already exist based on name")
    }
    const res = await Brand.insertOne({ name: payload?.name, req_user: userId, status: "approved" });
    return res;
}

const brandList = async () => {
    const res = await Brand.find({ status: "approved" });
    return res;
}

const brandListForAdmin = async (query: Record<string, any>) => {

    const brandModel = new QueryBuilder(Brand.find(), query)
        .search(['name']);

    const data: any = await brandModel.modelQuery;

    return data;
}

const updateBrandStatus = async (brandId: string, status: string) => {
    const res = await Brand.updateOne({ _id: brandId }, { status });
    return res;
}

export const brandService = {
    AddBrand,
    brandList,
    brandListForAdmin,
    updateBrandStatus,
    AddBrandByAdmin
}