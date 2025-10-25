import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IReport } from "./reports.interface";
import { Report } from "./reports.model";
import httpStatus from "http-status";

const addReport = async (payload: IReport, userId: string) => {
    const exist = await Report.findOne({ user: userId, product: payload?.product });
    if (exist) {
        throw new AppError(httpStatus.CONFLICT, "You already reported this product")
    }
    const res = await Report.insertOne({ product: payload?.product, reason: payload?.reason, user: userId });
    return res;
}

const reports = async (query: Record<string, any>) => {
    const reportModel = new QueryBuilder(Report.find().populate({ path: "user", select: "first_name last_name image" }).populate({ path: "product", select: "title images" }), query)
        .search(['reason'])
        .paginate()
        .sort();
    const data: any = await reportModel.modelQuery;
    const meta = await reportModel.countTotal();
    return {
        data,
        meta,
    };
}

const singleReport = async (reportId : string) => {

    const reportData = Report.findById(reportId).populate({ path: "user", select: "first_name last_name image" }).populate({ path: "product", populate: { path: "store" } })

    return reportData;

}

export const reportService = {
    addReport,
    reports,
    singleReport
}