import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { bannerService } from "./banner.service";
import config from "../../config";
import AppError from "../../error/AppError";
import { uploadToS3 } from "../../utils/s3";

const allBanners = catchAsync(async (req, res) => {
    const result = await bannerService.banners();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banners retrive successfully',
        data: result,
    });
})

const uploadBanner = catchAsync(async (req, res) => {

    let image;
    // image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    if (req.file) {
        image = await uploadToS3({
            file: req.file,
            fileName: `images/user/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    }

    if (!image) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Image upload failed',
        );
    }

    const result = await bannerService.uploadBanner(image);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banner Uploaded successfully',
        data: result,
    });
})

const deleteBanner = catchAsync(async (req, res) => {

    const result = await bannerService.deleteBanner(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Banner deleted successfully',
        data: result,
    });
})

export const bannerControler = {
    allBanners,
    uploadBanner,
    deleteBanner
}