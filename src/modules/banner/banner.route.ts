import { Router } from "express";
import { bannerControler } from "./banner.controler";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { image_Upload } from "../../utils/s3";

const router = Router();

router.get("/", bannerControler.allBanners);

router.delete("/:id", 
    auth(USER_ROLE.admin),
     bannerControler.deleteBanner);

router.post("/",
    auth(USER_ROLE.admin),
    image_Upload.single('image'),
    bannerControler.uploadBanner);

export const bannerRouts = router;