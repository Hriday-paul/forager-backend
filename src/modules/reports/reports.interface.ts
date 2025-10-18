
import { ObjectId } from "mongoose";

export interface IReport {
    user: ObjectId,
    product: ObjectId,
    reason: string,
    status : "pending" | "resolved",
}