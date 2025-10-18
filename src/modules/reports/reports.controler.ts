import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync";
import { reportService } from "./reports.service";
import sendResponse from "../../utils/sendResponse";

const AddReport = catchAsync(async (req, res) => {
    const result = await reportService.addReport(req.body, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product reported successfully',
        data: result,
    });
})
const reports = catchAsync(async (req, res) => {
    const result = await reportService.reports(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all reports retrived successfully',
        data: result,
    });
})

export const reportControler = {
    AddReport,
    reports
}