import Joi from 'joi';
import { User } from "../models/user.model.js";
import _ from "lodash";

export async function validateUserRegistration(req, res, next) {
    try {
        // const schema = Joi.object({
        //     Names: Joi.string().min(5).required(),
        //     Email: Joi.string().min(5).required().label("email"),
        //     Gender: Joi.string().required().label('gender'),
        //     Age: Joi.number().required().label('age'),
        //     Dob: Joi.string().required().label('dob'),
        //     MaritialStatus: Joi.string().required().label("maritialStatus"),
        //     nationality: Joi.string().required().label('nationality'),
        //     Password: Joi.string().min(8).required().label("password")
        // })
  
        const schema = Joi.object({
            names: Joi.string().min(5).required(),
            email: Joi.string().min(5).required(),
            gender: Joi.string().required(),
            age: Joi.number().required(),
            dob: Joi.string().required(),
            maritialStatus: Joi.string().required(),
            nationality: Joi.string().required(),
            accountType: Joi.string().required(),
            password: Joi.string().min(8).required()
        })
        const { error } = schema.validate(_.pick(req.body,  [
            "names",
            "email",
            "gender",
            "age",
            "dob",
            "maritialStatus",
            "password",
            "nationality",
            "accountType"
        ]));
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to create the account."
            })
        }
        let checkEmail = await User.findOne({ Email: req.body.Email })
        if (checkEmail) return res.status(400).send("Email is already registered!")

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validateLogin(req, res, next) {
    try {
        const schema = Joi.object({
            Email: Joi.string().min(5).required().label("Email"),
            Password: Joi.string().min(5).required().label("Password"),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to login to your account."
            })
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validatePasswordReset(req, res, next) {
    try {
        const schema = Joi.object({
            newPassword: Joi.string().min(6).required()
        })
        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to continue with password reset."
            })
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validateProfileUpdate(req, res, next) {
    try {
        const schema = Joi.object({
            Firstname: Joi.string().min(5).label("First name"),
            Lastname: Joi.string().min(5).label("Last name"),
            Phone: Joi.number().min(10).label("Phone number"),
            Address: Joi.string().label("Address"),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to update profile."
            })
        }
        if (req.body.Phone) {
            if ((req.body.Phone).length < 10 || (req.body.Phone).length > 10) return res.status(400).send("Phone Number must be 10 characters!")
            req.body.Phone = (req.body.Phone).toString()
            let validRwandanPhoneNumbers = ['078', '079', '072', '073']
            let first3Characters = (req.body.Phone.toString()).substring(0, 3)
            if (validRwandanPhoneNumbers.includes(first3Characters) != true) {
                return res.status(400).send("Phone Number must be a valid Rwandan Phone Number!")
            }
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validatePasswordChange(req, res, next) {
    try {
        const schema = Joi.object({
            oldPassword: Joi.string().min(6).required(),
            newPassword: Joi.string().min(6).required()
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to update profile."
            })
        }
        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}