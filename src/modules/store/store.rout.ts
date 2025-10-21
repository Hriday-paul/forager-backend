import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { createStoreValidator } from "./store.validator";
import req_validator from "../../middleware/req_validation";
import { storeControler } from "./store.controler";
import parseData from "../../middleware/parseData";
import { image_Upload } from "../../utils/s3";

const router = Router();

router.post('/',
    auth(USER_ROLE.user),
    image_Upload.fields([
        {
            name: "cover_photo",
            maxCount: 1
        },
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    parseData(),
    createStoreValidator,
    req_validator(),
    storeControler.addStore
);

router.get("/", auth(USER_ROLE.admin), storeControler.allStores);

router.get("/my-store", auth(USER_ROLE.user), storeControler.myStoreAccount)

router.get("/near-me-stores", auth(USER_ROLE.user), storeControler.nearMeStores)

router.patch("/approve/:id", auth(USER_ROLE.admin), storeControler.approveStoreStatus);
router.patch("/reject/:id", auth(USER_ROLE.admin), storeControler.rejectStoreStatus);


router.get("/:id", storeControler.storeDetails);

export const StoreRouts = router;