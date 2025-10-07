import { ObjectId } from "mongoose";

export interface IStore {
    name: string,
    cover_photo: string,
    photo: string,
    open_time: string,
    address: string,

    location: { type: string, coordinates: number[] },

    status: "pending" | "approved" | "rejected",
    user : ObjectId
}