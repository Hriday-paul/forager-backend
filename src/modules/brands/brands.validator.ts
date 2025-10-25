import { check } from "express-validator";

export const addBrandValidator = [
  check('name').trim().not().isEmpty().withMessage('name is required').isString(),
]

export const brandStatusUpdatevalidate = [
  check("status").trim().not().isEmpty().withMessage('status is required').isIn(["approved", "rejected"]).withMessage("invalid status"),
]