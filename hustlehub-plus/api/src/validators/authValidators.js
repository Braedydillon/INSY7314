import { body } from 'express-validator';

export const registerRules = [

    body('email')
        .trim()
        .notEmpty().withMessage('Please enter an email address.').bail()
        .isEmail().withMessage('Valid email is required.')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Please enter a password').bail()
        .isStrongPassword({
            minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols:1
        }).withMessage('Password must be 12 characters minimum and inlude 1 symbol, number, upprcase, and lowercase character')

]

export const loginRules = [
    // TODO
]