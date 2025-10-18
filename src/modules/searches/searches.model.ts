import { Schema, Types, model } from 'mongoose';
import { ISearches, ISearchesModel } from './searches.interface';

const searcheSchema = new Schema<ISearches>(
    {
        categories: {
            type: [String],
        },
        brands: {
            type: [String],
        },
        sizes: {
            type: [String],
        },
        user: {
            type: Types.ObjectId,
            required: true,
            ref: 'users',
        }
    },
    {
        timestamps: true,
    },
);

const Search = model<ISearches, ISearchesModel>('searches', searcheSchema);

export default Search;
