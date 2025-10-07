import config from "../../config";
import AppError from "../../error/AppError";
import { deleteFromS3 } from "../../utils/s3";
import { Banners } from "./banner.model";
import httpStatus from 'http-status';

const banners = async () => {

    const res = await Banners.find();

    return res;
}

const uploadBanner = async (image: string) => {
    const res = await Banners.create({ image })
    return res;
}

const deleteBanner = async (bannerId: string) => {

    const res = await Banners.findOneAndDelete({ _id: bannerId })

    if (!res) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Banner not found',
        );
    }

    // if (res.image) {
    //     const key = res.image.split(config.aws.aws_url!)[1]
    //     const dlt_res = await deleteFromS3(key);
    //     console.log(dlt_res)
    // }

    return res;
}

export const bannerService = {
    banners,
    uploadBanner,
    deleteBanner,
}