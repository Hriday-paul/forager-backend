import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface ISearches {
    _id: ObjectId;
    categories?: string[];
    brands ?: string[]
    sizes ?: string[];
    user: IUser;
}

export type ISearchesModel = Model<ISearches, Record<string, unknown>>;
