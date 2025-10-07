import { ObjectId } from "mongoose";

export interface IProduct {
    title: string;
    category: "womens_clothes" | "mens_clothes" | "health/beauty" | "purses" | "accessories",
    sub_category: string | null
    images: string[],
    brand: string,
    price: number,
    quantity: number,
    details: string,
    // location : {type : string, coordinates : number[]}
    sizes: string[],
    colors: string[],
    isDeleted: boolean,
    user: ObjectId,
    store: ObjectId,
    total_views: number,

    could_not_find_reqs: ObjectId[]
    bought_reqs: {user : ObjectId, type : "available" | "unavailable"}[]
}