const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = Router();

// Сохраняем регистр локальной части почты, как ввёл пользователь
const normalizeOpts = {
    all_lowercase: false,
    gmail_lowercase: false,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_lowercase: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_lowercase: false,
    yahoo_remove_subaddress: false,
    icloud_lowercase: false,
    icloud_remove_subaddress: false,
};

const emailRule = body('email')
    .isString().withMessage('Email must be a string')
    .trim()
    .isEmail().withMessage('Invalid email')
    .isLength({ max: 255 }).withMessage('Email is too long')
    .normalizeEmail(normalizeOpts);

const passwordRule = body('password')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters');

const nicknameRule = body('nickname')
    .isString().withMessage('Nickname must be a string')
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Nickname must be 2-30 characters')
    .matches(/^[\w.-]+$/).withMessage('Nickname may contain only letters, digits, _ . -');

router.post('/register', [emailRule, nicknameRule, passwordRule], authController.register);
router.post('/login', [emailRule, passwordRule], authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/activate/:link', authController.activate);

module.exports = router;