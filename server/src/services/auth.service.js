const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserModel = require('../models/user.model');
const mailService = require('./mail.service');
const tokenService = require('./token.service');
const UserDto = require('../dtos/user.dto');
const ApiError = require('../exeptions/api.error');

class AuthService {
    async register(email, nickname, password) {
        const candidate = await UserModel.findOne({ $or: [{ email }, { nickname }] });
        if (candidate) {
            if (candidate.email === email) {
                throw ApiError.ExistingUserError();
            }
            throw ApiError.Conflict('This nickname is already taken');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const activationLink = crypto.randomUUID();

        let user;
        try {
            user = await UserModel.create({ email, nickname, passwordHash, activationLink });
        } catch (e) {
            if (e.code === 11000) {
                throw ApiError.Conflict('User with this email or nickname already exists');
            }
            throw e;
        }

        try {
            await mailService.sendActivationMail(
                email,
                `${process.env.API_URL}/api/auth/activate/${activationLink}`
            );
        } catch (e) {
            await UserModel.deleteOne({ _id: user._id });
            console.error(e);
            throw ApiError.Internal('Failed to send activation email');
        }

        return this.#issueTokens(user);
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Incorrect activation link');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email });

        const isPasswordEqual = user && await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordEqual) {
            throw ApiError.BadRequest('Invalid email or password');
        }

        return this.#issueTokens(user);
    }

    async logout(refreshToken) {
        return tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        if (!user) {
            throw ApiError.UnauthorizedError();
        }

        await tokenService.removeToken(refreshToken);

        return this.#issueTokens(user);
    }

    async #issueTokens(user) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }
}

module.exports = new AuthService();