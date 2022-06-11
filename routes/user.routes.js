import express from 'express'
const router = express.Router()
import { changePassword, checkCode, createUser, deleteAccount, getUserInformation, login, resetPassword, sendResetCode, updateUserInformation, validateUserEmail } from '../controllers/user.controller.js'
import authenticate from '../middlewares/auth.middleware.js';
import { validateLogin, validatePasswordReset, validateProfileUpdate, validateUserRegistration } from '../validators/user.validator.js';
import { uploadFile } from "../utils/fileUpload.utils.js";
const upload = uploadFile()

router.get("/user/profile", authenticate, getUserInformation)

router.post("/register", upload.single("profilePicture"), validateUserRegistration, createUser)


router.patch("/verifyEmail", validateUserEmail)

router.post("/login", validateLogin, login)

router.post("/forgotPassword/sendResetCode", sendResetCode)

router.get("/forgotPassword/checkCode/:userId/:code", checkCode)

router.patch("/resetPassword/:userId", validatePasswordReset, resetPassword)

router.patch("/user/profile/changePassword", authenticate, changePassword)

export default router;