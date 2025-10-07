import express, { NextFunction, Request, Response } from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { contactRoutes } from './modules/contact/contact.route';

import { dashboardRouts } from './modules/dasboard/dashboard.rout';
import { settingsRoutes } from './modules/settings/settings.rout';
import { productRoutes } from './modules/products/products.route';
import { reviewRoutes } from './modules/review/review.route';
import { bannerRouts } from './modules/banner/banner.route';
import { notificationRoute } from './modules/notification/notification.routes';
import { favouriteRouts } from './modules/favourites/favourites.rout';
import { StoreRouts } from './modules/store/store.rout';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRouts,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/contacts',
        route: contactRoutes,
    },
    {
        path: '/dashboard',
        route: dashboardRouts,
    },
    {
        path: '/products',
        route: productRoutes,
    },
    {
        path: '/reviews',
        route: reviewRoutes,
    },
    {
        path: '/banners',
        route: bannerRouts,
    },
    {
        path: '/notifications',
        route: notificationRoute,
    },
    {
        path: '/setting',
        route: settingsRoutes,
    },
    {
        path: '/favourites',
        route: favouriteRouts,
    },
    {
        path: '/stores',
        route: StoreRouts,
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;