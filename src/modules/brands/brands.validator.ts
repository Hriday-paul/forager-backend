import { check } from "express-validator";

export const addBrandValidator = [
  check('name').trim().not().isEmpty().withMessage('name is required').isString(),
]