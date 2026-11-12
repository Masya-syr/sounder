const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const ApiError = require('../exeptions/api.error');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res, token) =>
    res.cookie('refreshToken', token, { ...COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE });

class AuthController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }

            const { email, nickname, password } = req.body;
            const userData = await authService.register(email, nickname, password);

            setRefreshCookie(res, userData.refreshToken);
            return res.status(201).json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }

            const { email, password } = req.body;
            const userData = await authService.login(email, password);

            setRefreshCookie(res, userData.refreshToken);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            return res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            await authService.activate(req.params.link);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await authService.refresh(refreshToken);

            setRefreshCookie(res, userData.refreshToken);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController();