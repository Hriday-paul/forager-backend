import { Router } from "express";
import { productControler } from "./products.controler";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import parseData from "../../middleware/parseData";
import { addProductValidator, boughtValidate, productQueryChecker } from "./products.validator";
import req_validator from "../../middleware/req_validation";
import { image_Upload } from "../../utils/s3";

const router = Router();

router.post("/",
    auth(USER_ROLE.user),
    image_Upload.array('images'),
    parseData(),
    addProductValidator,
    req_validator(),
    productControler.addProduct);

router.get('/', auth(USER_ROLE.user), productQueryChecker, req_validator(), productControler.allProducts);

router.get('/my-products', auth(USER_ROLE.user), productQueryChecker, req_validator(), productControler.myProducts);

router.get('/store-products/:id', productControler.storeProducts);
router.get('/store-popular-products/:id', productControler.getMostFavouriteProductsByStore);
router.get('/listing-count', auth(USER_ROLE.user), productControler.listingCount);

router.get('/recent-views', auth(USER_ROLE.user), productControler.recentViewProducts);

router.get('/:id', auth(USER_ROLE.user, USER_ROLE.admin), productControler.singleProduct);

router.patch(
    '/:id',
    auth(USER_ROLE.user),
    // multiple_image_Upload,
    parseData(),
    productControler.updateProduct,
);
router.post(
    '/couldnot-find/:id',
    auth(USER_ROLE.user),
    productControler.couldNotFindReq,
);
router.post(
    '/bought/:id',
    auth(USER_ROLE.user),
    boughtValidate,
    req_validator(),
    productControler.boughtReq,
);

router.delete(
    '/:id',
    auth(USER_ROLE.user),
    productControler.deleteProduct
);


export const productRoutes = router;

