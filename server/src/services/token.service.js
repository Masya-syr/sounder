const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const hashToken = require('../utils/hash-token.util');
const tokenModel = require('../models/token.model');

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '30m',
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '30d',
            jwtid: crypto.randomUUID(),
        });
        return { accessToken, refreshToken };
    }

   async saveToken(userId, refreshToken) {
        await tokenModel.create({
            userId,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        });
    }   

    async removeToken(refreshToken) {
        return tokenModel.deleteOne({ tokenHash: hashToken(refreshToken) });
    }

    async findToken(refreshToken) {
        return tokenModel.findOne({ tokenHash: hashToken(refreshToken) });
    }

    validateRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
                algorithms: ['HS256'],
            });
        } catch {
            return null;
        }
    }

    validateAccessToken(accessToken) {
        try {
            return jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, {
                algorithms: ['HS256'],
            });
        } catch {
            return null;
        }
    }
}

module.exports = new TokenService();