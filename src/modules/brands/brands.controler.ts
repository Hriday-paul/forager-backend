import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { brandService } from "./brands.service";
import httpStatus from "http-status"

const AddBrand = catchAsync(async (req, res) => {
    const result = await brandService.AddBrand(req.body, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New brand added successfully',
        data: result,
    });
})
const AddBrandByAdmin = catchAsync(async (req, res) => {
    const result = await brandService.AddBrandByAdmin(req.body, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New brand added successfully',
        data: result,
    });
})

const brandList = catchAsync(async (req, res) => {
    const result = await brandService.brandList()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Brand list retrived successfully',
        data: result,
    });
})
const brandListForAdmin = catchAsync(async (req, res) => {
    const result = await brandService.brandListForAdmin(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Brand list retrived successfully',
        data: result,
    });
})
const updateBrandStatus = catchAsync(async (req, res) => {
    const result = await brandService.updateBrandStatus(req.params.id, req.body.status)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Brand status updated successfully',
        data: result,
    });
})

export const brandControler = {
    AddBrand,
    brandList,
    brandListForAdmin,
    updateBrandStatus,
    AddBrandByAdmin
}