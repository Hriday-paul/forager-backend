import { check } from "express-validator";

export const addReportValidator = [
  check('reason').trim().not().isEmpty().withMessage('reason is required').isString(),
  check('product').trim().not().isEmpty().withMessage('product is required').isMongoId().withMessage("invalid product"),
]