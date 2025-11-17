import { check, query } from "express-validator";

export const createStoreValidator = [
    check('name').trim().not().isEmpty().withMessage('Store name is required').isString().withMessage('Store name should be string').isLength({ min: 1 }).withMessage('Store name min length is 1'),

    check('open_time').optional().trim().isString().withMessage('Invalid open_time'), //
    check('address').optional().trim().isString(),
    check('location').not().isEmpty().withMessage('location is required'),
    check('location.coordinates')
        .isArray({ min: 2, max: 2 }).withMessage('coordinates must contain [longitude, latitude]'),

    check('location.coordinates.*')
        .isFloat().withMessage('each coordinate must be a number'),
]

export const neaMeStoreValidator = [

    query("long").trim().not().isEmpty().withMessage('long is required').isFloat().withMessage("long invalid"),
    query("lat").trim().not().isEmpty().withMessage('lat is required').isFloat().withMessage("lat invalid"),
]