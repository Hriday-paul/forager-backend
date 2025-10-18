import config from "../../config";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import { uploadManyToS3 } from "../../utils/s3";
import sendResponse from "../../utils/sendResponse";
import { Stores } from "../store/store.model";
import { productService } from "./products.service";
import httpStatus from 'http-status'

const addProduct = catchAsync(async (req, res) => {

    const have_store = await Stores.findOne({ user: req.user?._id, status: "approved" })

    if (!have_store) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'You do not have an approved store account.',
        );
    }

    const files = req.files as Express.Multer.File[];

    let filePaths: string[] = [];

    if (files) {
        const imgsArray: { file: any; path: string; key?: string }[] = [];

        files?.map(image => {
            imgsArray.push({
                file: image,
                path: `images/products/images`,
            });
        });

        const urls = await uploadManyToS3(imgsArray);
        filePaths = urls?.map(i => i?.url);
    }

    if (filePaths?.length <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Minimum 1 image is required',
        );
    }

    req.body.images = filePaths;
    req.body.store = have_store?._id
    req.body.user = req.user?._id

    const result = await productService.addProduct(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All products fetched successfully',
        data: result,
    });
})

const allProducts = catchAsync(async (req, res) => {
    const query = req.query
    const result = await productService.allProducts(query, req?.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All products fetched successfully',
        data: result,
    });
})

const myProducts = catchAsync(async (req, res) => {
    const query = req.query
    const result = await productService.myProducts(query, req.user._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My products retrived successfully',
        data: result,
    });
})

const storeProducts = catchAsync(async (req, res) => {
    const result = await productService.storeProducts(req.query, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Store products retrived successfully',
        data: result,
    });
})
const getMostFavouriteProductsByStore = catchAsync(async (req, res) => {
    const result = await productService.getMostFavouriteProductsByStore(req.query, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Store popular products retrived successfully',
        data: result,
    });
});

const couldNotFindReq = catchAsync(async (req, res) => {
    const result = await productService.couldNotFindReq(req.params.id, req.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'You feedback submited successfully',
        data: result,
    });
})
const boughtReq = catchAsync(async (req, res) => {
    const result = await productService.boughtReq(req.params.id, req.user?._id, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'You feedback submited successfully',
        data: result,
    });
})

const singleProduct = catchAsync(async (req, res) => {
    const result = await productService.singleProduct(req.params.id, req?.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product fetched successfully',
        data: result,
    });
})

const updateProduct = catchAsync(async (req, res) => {

    const files = req.files as Express.Multer.File[];

    const filePaths = files.map(file => {
        return file?.filename && (config.BASE_URL + '/images/' + file.filename) || '';
    });

    const result = await productService.updateProduct(req.body, req.params.id, filePaths)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'product updated successfully',
        data: result,
    });
});

const deleteProduct = catchAsync(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id, req.user._id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

const sendNotificationAfterAddProduct = catchAsync(async (req, res) => {
    const result = await productService.sendNotificationAfterAddProduct(req.user._id, req.body.product);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product alert successfully',
        data: result,
    });
});

const listingCount = catchAsync(async (req, res) => {
    const result = await productService.listingCount(req.user._id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'listing count',
        data: result,
    });
});

export const productControler = {
    addProduct,
    allProducts,
    myProducts,
    updateProduct,
    deleteProduct,
    storeProducts,
    couldNotFindReq,
    boughtReq,
    getMostFavouriteProductsByStore,
    singleProduct,
    sendNotificationAfterAddProduct,
    listingCount
}