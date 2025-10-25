import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { brandControler } from "./brands.controler";
import { addBrandValidator, brandStatusUpdatevalidate } from "./brands.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post("/", addBrandValidator, req_validator(), auth(USER_ROLE.user), brandControler.AddBrand);
router.post("/by-admin", addBrandValidator, req_validator(), auth(USER_ROLE.admin), brandControler.AddBrandByAdmin);
router.get("/", auth(USER_ROLE.user), brandControler.brandList);
router.get("/for-admin", auth(USER_ROLE.admin), brandControler.brandListForAdmin);

router.patch("/update-status/:id", auth(USER_ROLE.admin), brandStatusUpdatevalidate, req_validator(), brandControler.updateBrandStatus);

export const brandRouts = router;