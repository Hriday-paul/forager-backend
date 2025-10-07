import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import httpStatus from "http-status";


const addReview = catchAsync(async (req, res) => {

    const result = await reviewService.addReview(req.body, req.user._id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'review added successfully',
        data: result,
    });
})

const reviewsByProduct = catchAsync(async (req, res) => {
    const result = await reviewService.reviewsByProduct(req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrive successfully',
        data: result,
    });
})

const myProductsreviews = catchAsync(async (req, res) => {
    const result = await reviewService.myProductsreviews(req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrive successfully',
        data: result,
    });
})

export const reviewControler = {
    addReview,
    reviewsByProduct,
    myProductsreviews
}