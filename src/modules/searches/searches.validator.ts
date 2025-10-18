
import { check } from "express-validator";

export const addSearchValidator = [

    check('category')
        .optional()
        .isArray({ min: 1 }).withMessage('minimum 1 category required')
        .isIn(["womens_clothes", "mens_clothes", "health/beauty", "purses", "accessories"])
        .withMessage('invalid category'),

        check('brands')
        .optional()
        .isArray({ min: 1 }).withMessage('minimum 1 brands required'),

        check('sizes')
        .optional()
        .isArray({ min: 1 }).withMessage('minimum 1 sizes required')

]