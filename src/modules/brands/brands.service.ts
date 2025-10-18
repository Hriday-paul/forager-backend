import { IBrand } from "./brands.interface";
import { Brand } from "./brands.model";

const AddBrand = async (payload: IBrand, userId: string) => {
    //check already exist
    const exist = await Brand.find({name : { $regex: name, $options: "i" }})
    const res = await Brand.insertOne({ name: payload?.name, req_user: userId, status: "pending" });
    return res;
}

const brandList = async () => {
    const res = await Brand.find();
    return res;
}

export const brandService = {
    AddBrand,
    brandList
}