import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { brandControler } from "./brands.controler";
import { addBrandValidator } from "./brands.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post("/", addBrandValidator, req_validator(), auth(USER_ROLE.user), brandControler.AddBrand);
router.get("/", auth(USER_ROLE.user), brandControler.brandList);

export const brandRouts = router;