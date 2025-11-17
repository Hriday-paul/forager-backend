import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { uploadToS3 } from "../../utils/s3";
import { storeService } from "./store.service";

const addStore = catchAsync(async (req, res) => {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
        //cover photo
        if (files?.cover_photo?.length) {
            req.body.cover_photo = (await uploadToS3({
                file: files?.cover_photo[0],
                fileName: `images/user/banner/${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`,
            })) as string;
        }

        // store photo
        if (files?.photo?.length) {
            req.body.photo = (await uploadToS3({
                file: files?.photo[0],
                fileName: `images/user/${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`,
            })) as string;
        }
    }

    const result = await storeService.createStore(req.body, req.user._id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store created successfully, please wait for review your store account',
        data: result,
    });
})


const allStores = catchAsync(async (req, res) => {
    const result = await storeService.allStores(req.query)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'stores retrived successfully',
        data: result,
    });

})

const myStoreAccount = catchAsync(async (req, res) => {
    const result = await storeService.myStoreAccount(req.user._id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store account retrived successfully',
        data: result,
    });

})
const storeDetails = catchAsync(async (req, res) => {
    const result = await storeService.storeDetails(req.params.id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store account retrived successfully',
        data: result,
    });

})
const nearMeStores = catchAsync(async (req, res) => {
    const result = await storeService.nearMeStores(req.query)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'near me stores retrived successfully',
        data: result,
    });

})
const approveStoreStatus = catchAsync(async (req, res) => {
    const result = await storeService.approveStoreStatus(req.params.id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store approved successfully',
        data: result,
    });
})
const rejectStoreStatus = catchAsync(async (req, res) => {
    const result = await storeService.rejectStoreStatus(req.params.id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store approved successfully',
        data: result,
    });
});


const updateStore = catchAsync(async (req, res) => {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
        //cover photo
        if (files?.cover_photo?.length) {
            req.body.cover_photo = (await uploadToS3({
                file: files?.cover_photo[0],
                fileName: `images/user/banner/${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`,
            })) as string;
        }

        // store photo
        if (files?.photo?.length) {
            req.body.photo = (await uploadToS3({
                file: files?.photo[0],
                fileName: `images/user/${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`,
            })) as string;
        }
    }

    const result = await storeService.updateStore(req.body, req.params.id)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'store updated successfully',
        data: result,
    });
})

export const storeControler = {
    addStore,
    allStores,
    myStoreAccount,
    storeDetails,
    nearMeStores,
    approveStoreStatus,
    rejectStoreStatus,
    updateStore
}