const ApiError = require('../exceptions/api.error');
const tokenService = require('../services/token.service');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const [scheme, accessToken] = authorizationHeader.split(' ');
        if (scheme !== 'Bearer' || !accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData; // { id, email, nickname, isActivated, iat, exp }
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
};