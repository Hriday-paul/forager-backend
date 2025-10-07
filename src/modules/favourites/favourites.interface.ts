
import { Model, ObjectId } from 'mongoose';

export interface IFavourites {
  user : ObjectId,
  product : ObjectId
}