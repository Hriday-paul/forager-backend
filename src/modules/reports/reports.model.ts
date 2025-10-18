
import { model, Schema } from 'mongoose';
import { IReport } from './reports.interface';

const ReportSchema: Schema<IReport> = new Schema(
    {
        reason: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'products', required: true },
        status: { type: String, enum: ["pending", "resolved"], default: "pending" }
    },
    { timestamps: true },
);

export const Report = model<IReport>('reports', ReportSchema);