
import { ObjectId } from "mongoose";

export interface IBrand {
    req_user: ObjectId,
    name: string,
    status : "pending" | "approved",
}