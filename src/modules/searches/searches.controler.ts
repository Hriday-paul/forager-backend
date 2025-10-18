import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { searchServices } from './searches.service';
import sendResponse from '../../utils/sendResponse';

const createSearch = catchAsync(async (req: Request, res: Response) => {

    const result = await searchServices.addnewSearches(req?.user?._id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'New search created successfully',
        data: result,
    });
});

const mySearchHistory = catchAsync(async (req: Request, res: Response) => {

    const result = await searchServices.mySearchHistory(req?.user?._id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'My search history retrived successfully',
        data: result,
    });
});

const DeletemySearchHistory = catchAsync(async (req: Request, res: Response) => {

    const result = await searchServices.DeletemySearchHistory(req?.params?.id, req?.user?._id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Search history deleted successfully',
        data: result,
    });

});

export const SearchControler = {
    createSearch,
    mySearchHistory,
    DeletemySearchHistory
}
