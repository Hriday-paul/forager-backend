import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { favouriteService } from "./favourites.service";
import httpStatus from "http-status"

const deleteFavourite = catchAsync(async (req, res) => {

    const result = await favouriteService.deletefavourite(req?.params?.id, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product removed successfully from favourite',
        data: result,
    });
})

const addFavourite = catchAsync(async (req, res) => {

    const result = await favouriteService.addFavourite(req?.body?.product, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New favourite added successfully',
        data: result,
    });
})

const myAllFavourites = catchAsync(async (req, res) => {

    const result = await favouriteService.getAllMyFavourites(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My all favourite products retrived successfully',
        data: result,
    });
});

export const favouriteController = {
    myAllFavourites,
    addFavourite,
    deleteFavourite
}