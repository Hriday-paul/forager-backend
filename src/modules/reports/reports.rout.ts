import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import req_validator from "../../middleware/req_validation";
import { addReportValidator } from "./reports.validator";
import { reportControler } from "./reports.controler";

const router = Router();

router.post("/", addReportValidator, req_validator(), auth(USER_ROLE.user), reportControler.AddReport);
router.get("/", auth(USER_ROLE.admin), reportControler.reports);

export const reportRouts = router;