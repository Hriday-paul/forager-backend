import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { SearchControler } from "./searches.controler";
import { addSearchValidator } from "./searches.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();


router.patch(
    '/',
    addSearchValidator,
    req_validator(),
    auth(USER_ROLE.user),
    SearchControler.createSearch,
);

router.get(
    '/my-history',
    auth(USER_ROLE.user),
    SearchControler.mySearchHistory,
);

router.delete(
    '/my-history/:id',
    auth(USER_ROLE.user),
    SearchControler.DeletemySearchHistory,
);

export const searchRouts = router;