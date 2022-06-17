import { User } from "../models/user.model.js";
import lodash from "lodash";
const { pick } = lodash;
import { genSalt, hash } from "bcrypt";
import { sendEmail } from "../utils/emailConfig.utils.js";
import bcrypt from "bcrypt";
const { compare } = bcrypt;
import cloudinary from "../utils/cloudinary.js";

export const pyUploadFile = async (req, res) => {
  console.log("req",req.data)
  let docInfo = await cloudinary.uploader.upload(req.file.path)
            let secure_url = docInfo.secure_url
            let cloudinaryId = docInfo.public_id
            
  try {
    if (req.file.path) {
       console.log("Data Uploaded")
     }
  } catch (error) {
      return res.json({message: "failed to upload property files", status: 500})
  }

}

export const uploadFiles = async (req,res) => {
  let docInfo = await cloudinary.uploader.upload(req.file.path)
            let secure_url = docInfo.secure_url
            let cloudinaryId = docInfo.public_id
            
  try {
      let result = await User.findByIdAndUpdate(req.params.id, {
        profilePicture: secure_url,
        profilePicture_cloudinary_id: cloudinaryId
      })
      if(result) return res.json({message: "successfully uploaded the files", status: 200})
  } catch (error) {
      return res.json({message: "failed to upload property files", status: 500})
  }
}


export const getUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId)
    if (!user) return res.status(404).send("User not found!");
    return res.status(200).send({
      status: 200,
      message: "ok",
      data: user,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const createUser = async (req, res) => {
  try {
    let user = new User(
      pick(req.body, [
        "names",
        "email",
        "gender",
        "age",
        "dob",
        "maritialStatus",
        "profilePicture",
        "password",
        "accountType",
        "nationality"
      ])
    );



    let docInfo = await cloudinary.uploader.upload(req.file.path)
            let secure_url = docInfo.secure_url
            let cloudinaryId = docInfo.public_id
            let profilePicture = {
                profilePictureUrl: secure_url,
                profilePictureId: cloudinaryId
              }

    user.profilePicture = profilePicture.profilePictureUrl
    user.profilePicture_cloudinary_id = profilePicture.profilePictureId
    
    console.log('user',user)
    const time = new Date();
    let randomCode = Math.floor(1000 + Math.random() * 9000);
    user.verificationCode = "CZ" + randomCode.toString();
    let checkVerificationCode = await User.findOne({
      verificationCode: user.verificationCode,
    });
    if (checkVerificationCode) {
      let randomCode = Math.floor(2000 + Math.random() * 80000);
      user.verificationCode = "CZ" + randomCode.toString();
    }
    const salt = await genSalt(10);
    user.password = await hash(user.password, salt);

    try {
      const subject = "Company Z: Verify Your Email";
      const html = `<body>
            <div style="background-color: #FFF;width: 100%;height: 120px;">
            </div>
            <div style="width:90%;margin: -2% 2% 2% 4%;box-shadow: 2px 2px 10px rgb(196, 196, 196);background-color: #fff;border-radius: 5px;position: relative;padding-bottom: 4%;">
                <h1 style="font-family: sans-serif;font-size: 30px;font-weight: bold;text-align: center;color:#265DE7;text-transform: uppercase;padding-top: 2%;">Company Z</h1>
                <p style="font-family: sans-serif;font-size: 18px;margin: 2% 1.5%;"><span style="font-weight: bold;">Verify Your Email Using the code below.</span> You will find the respective field where you will enter the provided code. This is a One Time Pin which means it can only be used once. If you did not request this please ignore the message.If you did then copy the following Code.</p>
                <div style="display: flex;">
                    <textarea id="code" rows=1 cols=1 readonly style="text-align:center;font-family:sans-serif;font-weight:bold;font-size:20px;padding:0.9% 0% 0.5% !important;background-color: rgba(9, 44, 9, 0.185); width: 20%;margin-left: 45%;resize: none;border:none;">${
                      user.verificationCode
                    }</textarea>
                </div>
            </div>
                <p style="background-color: #265DE7;width: 100%;margin-top: 1%;color: #fff;text-align: center;font-family: sans-serif;padding:1% 0%;"><span style="font-weight: bold;">Company Z</span>&copy; ${time.getFullYear()}</p>
        </body>`;
      let checkSendEmail = sendEmail(user.email, subject, html);
      checkSendEmail
      .then(async(info) => {
        await user.save();
        return res.status(201).send({
          success: true,
          message:
            "Registered successfully. Check your email to complete email verification",
        });
      })
      .catch(err => {
        console.log(err)
        return res.status(400).send({
          message: "Unable to send the email for verification",
        });
      })
    } catch (ex) {
      res.status(400).send({message: ex.message});
    }
  } catch (ex) {
    res.status(500).send({message: ex.message});
  }
};

export const validateUserEmail = async (req, res) => {
  const code = req.body.code;
  if (!code)
    return res.status(400).send("You must provide a verification code!");
  try {
    let checkCode = await User.findOne({
      verificationCode: code,
      isVerified: false,
    });
    if (!checkCode) return res.status(400).send("Invalid verification code");

    let user = await User.findOneAndUpdate(
      { verificationCode: code },
      { isVerified: true },
      { new: true }
    );
    res
      .status(200)
      .send({
        status: "success",
        message: "Email verification completed successfully. You can now login to your account!",
      });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const sendLoginLink = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid Email or Password!");

    if (!user.isVerified) {
      return res
        .status(400)
        .send({
          message: "You must first confirm your email. Check your inbox for confirmation code!",
          status: "error"
        });
    }

    const validPassword = await compare(req.body.password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid Email or Password!");

      const time = new Date();
      let randomCode = "CZ"+ (Math.floor(1000 + Math.random() * 9000)).toString();
    let checkVerificationCode = await User.findOne({
       "loginLink.code": randomCode,
    });
    if (checkVerificationCode) {
      randomCode = "CZ"+(Math.floor(2000 + Math.random() * 80000)).toString();
    }

    let link = `https://irembo-system-design.vercel.app/login/${user._id}/${randomCode}`
    
    
      try {
        const subject = "Company Z: Login Link";
        const html = `<body>
              <div style="background-color: #FFF;width: 100%;height: 120px;">
              </div>
              <div style="width:90%;margin: -2% 2% 2% 4%;box-shadow: 2px 2px 10px rgb(196, 196, 196);background-color: #fff;border-radius: 5px;position: relative;padding-bottom: 4%;">
                  <h1 style="font-family: sans-serif;font-size: 30px;font-weight: bold;text-align: center;color:#265DE7;text-transform: uppercase;padding-top: 2%;">Company Z</h1>
                  <p style="font-family: sans-serif;font-size: 18px;margin: 2% 1.5%;"><span style="font-weight: bold;">Login to CompanyZ platform with the link.</span> Click on the link!</p>
                  <div style="display: flex;">
                      <a href="${link}">Login</a>
                  </div>
              </div>
                  <p style="background-color: #265DE7;width: 100%;margin-top: 1%;color: #fff;text-align: center;font-family: sans-serif;padding:1% 0%;"><span style="font-weight: bold;">Company Z</span>&copy; ${time.getFullYear()}</p>
          </body>`;
        let checkSendEmail = await sendEmail(user.email, subject, html);
        if (checkSendEmail.accepted[0] === user.email) {
          await User.findByIdAndUpdate(
            user._id,
            {
              loginLink: {
                link: link,
                code: randomCode,
                creationTime: time,
              },
              requestLogin: true,
            },
            { new: true }
          );
          return res.status(200).send({
            message: `Sent the Login link to ${user.email}`,
            success: true
          });
        }
        
      } catch (ex) {
        res.status(400).send({message: ex.message, success: false});
      }

    

    res.send({
      status: 200,
      message: `Sent the Login link to ${user.email}`,
      success: true
    });
  } catch (ex) {
    res.status(400).send({ success: false, message: ex.message });
  }
};

export const loginWithLink = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    
    
    if (!user)
      return res
        .status(400)
        .send("Unable to find the user with the provided userId");
      
    // console.log('og', user.loginLink.link.splite('/')[4])
    // console.log('second',req.params.userLink)
  
    console.log("code",user.loginLink.code)
      if (
        user.loginLink &&
        user.loginLink.code != req.params.userCode
      ) {
        return res.status(400).send("Invalid Code!");
      }

      let time = new Date();
      let creationTimeInSeconds =
        user.loginLink.creationTime.getTime() / 1000;
      let timeInSeconds = time.getTime() / 1000;
      if (timeInSeconds - creationTimeInSeconds > 1800) {
        return res
          .status(400)
          .send(
            "Link Expired!"
          );
      }
  
     user =  await User.findByIdAndUpdate(
        user._id,
        {
          loginLink: {
            ...user.loginLink,
            valid: true
          },
        },
        { new: true }
      );
  

    if (!user.loginLink)
      return res.status(400).send("You don't have a login link");
    if (!user.loginLink.valid)
      return res.status(400).send("Invalid Login link");
    if (!user.requestLogin)
      return res.status(400).send("You did not request logging In");


    await User.findByIdAndUpdate(
      req.params.userId,
      {
        loginLink: null,
        requestLogin: false,
      },
      { new: true }
    );

    const token = user.generateAuthToken();

res.header("Authorization", token).send({
  status: 200,
  message: "Successful",
  token,
  data: user,
});

   
  } catch (ex) {
    console.log('ERRORR',ex.message)
    res.status(400).send(ex.message);
  }
};

export const checkCanReset = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send("User not found!");
    if (!user.requestPasswordReset) {
      console.log('reset', user)
      return res.status(401).send({ status: 401, success: false, message: "You did not request password resetting", data: user })
    } else {
      console.log('reset2',user)
      return res.status(200).send({
        status: 200,
        message: "ok",
        data: user,
        success: true
      });
    }
  } catch (ex) {
    return res.status(400).send(ex.message);
  }
};

export const sendResetLink = async (req, res) => {
  try {
    if (!req.body.email) return res.status(400).send("Email is required");

    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .send({ status: "error",message:"Unable to find the user with the provided email"});

    const time = new Date();
    let randomCode = "CZ"+ (Math.floor(1000 + Math.random() * 9000)).toString();
    let checkVerificationCode = await User.findOne({
      "passwordResetLik.code": randomCode,
    });
    if (checkVerificationCode) {
      randomCode = "CZ"+(Math.floor(2000 + Math.random() * 80000)).toString();
    }

    // let resetCode = Math.floor(10000 + Math.random() * 90000);
    let resetLink = `https://irembo-system-design.vercel.app/resetPassword/${user._id}/${randomCode}`
    
    const subject = "Company Z: Reset your password";
    const html = `<body>
    <div style="background-color: #FFF;width: 100%;height: 120px;">
    </div>
    <div style="width:90%;margin: -2% 2% 2% 4%;box-shadow: 2px 2px 10px rgb(196, 196, 196);background-color: #fff;border-radius: 5px;position: relative;padding-bottom: 4%;">
        <h1 style="font-family: sans-serif;font-size: 30px;font-weight: bold;text-align: center;color:#265DE7;text-transform: uppercase;padding-top: 2%;">Company Z</h1>
        <p style="font-family: sans-serif;font-size: 18px;margin: 2% 1.5%;"><span style="font-weight: bold;">Reset Password.</span>Click on the link!</p>
        <div style="display: flex;">
            <a href="${resetLink}">Reset Password</a>
        </div>
    </div>
        <p style="background-color: #265DE7;width: 100%;margin-top: 1%;color: #fff;text-align: center;font-family: sans-serif;padding:1% 0%;"><span style="font-weight: bold;">Company Z</span>&copy; ${time.getFullYear()}</p>
</body>`;
    let checkSendEmail = await sendEmail(user.email, subject, html);
    if (checkSendEmail.accepted[0] === user.email) {
      await User.findByIdAndUpdate(
        user._id,
        {
          passwordResetLink: {
            link: resetLink,
            code: randomCode,
            creationTime: time,
          },
          requestPasswordReset: true,
        },
        { new: true }
      );
      return res.status(200).send({
        message: `Sent the password reset code to ${user.email}`,
        data: {
          success: true,
          message:
            "Reset link sent",
          userId: user._id.toString(),
        },
      });
    } else {
      return res.status(400).send({
        message: "Unkown Email, Please register!",
        success: false
      });
    }
  } catch (ex) {
    res.status(500).send({ success: false, messaage: ex.message });
  }
};

export const checkCode = async (code, userId) => {
  try {
    let user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .send("Unable to find the user with the provided userId");

    if (
      user.loginLink &&
      user.loginLink.code != code
    ) {
      return res.status(400).send("Invalid Code!");
    }
    let time = new Date();
    let creationTimeInSeconds =
      user.loginLink.creationTime.getTime() / 1000;
    let timeInSeconds = time.getTime() / 1000;
    if (timeInSeconds - creationTimeInSeconds > 1800) {
      return res
        .status(400)
        .send(
          "Code Expired. Please go back to password reset page to get a new code"
        );
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        loginLink: {
          code: code,
          creationTime: time,
          valid: true,
        },
      },
      { new: true }
    );

    return res.status(200).send("Code is valid");
  } catch (ex) {
    return res.status(400).send(ex.message);
  }
};

export const checkResetLink = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send("Unable to find the user with the provided userId");  
    
        if (!user.requestPasswordReset) {
          return res.status(401).send({success: false, message: "You did not request password resetting"})
        }
        if (
          user.passwordResetLink &&
          user.passwordResetLink.code != req.params.userCode
        ) {
          return res.status(400).send("Invalid Code!");
        }
  
        let time = new Date();
        let creationTimeInSeconds =
          user.passwordResetLink.creationTime.getTime() / 1000;
        let timeInSeconds = time.getTime() / 1000;
        if (timeInSeconds - creationTimeInSeconds > 1800) {
          return res
            .status(400)
            .send(
              "Link Expired!"
            );
        }

        
    
       user =  await User.findByIdAndUpdate(
          user._id,
          {
            passwordResetLink: {
              ...user.passwordResetLink,
              valid: true
            },
          },
          { new: true }
    );
    return res.status(200).send("Code is valid");
    
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export const resetPassword = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    console.log('resetting password')
    if (!user.passwordResetLink)
      return res.status(400).send("You don't have a password reset code");
    if (!user.passwordResetLink.valid)
      return res.status(400).send("Invalid password reset code");
    if (!user.requestPasswordReset)
      return res.status(400).send("You did not request password resetting");

      const validPassword = await compare(req.body.oldPassword, user.password);
      if (!validPassword)
        return res.status(400).send({success: false, message: "Wrong Password!"});

    let salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.newPassword, salt);

    user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        password: newPassword,
        passwordResetLink: null,
        requestPasswordReset: false,
      },
      { new: true }
    );
    console.log("request",user.requestPasswordReset)

    res
      .status(200)
      .send({
        status: 200,
        success: true,
        message: "Reset Password Successfully!",
        data: user
      });
  } catch (ex) {
    res.status(500).send(ex.message);
  }
};

export const updateUserInformation = async (req, res) => {
  try {
    let docInfo = await cloudinary.uploader.upload(req.file.path)
    let secure_url = docInfo.secure_url
    let cloudinaryId = docInfo.public_id

    await User.findByIdAndUpdate(
      req.params.userId,
      {
        documentImage : secure_url,
        documentImage_cloudinary_id: cloudinaryId,
        documentNumber: req.body.documentNumber
       },
      { new: true }
    );
    return res.status(200).send({
      success: true,
      message: "Added your Info"
    })
  } catch (ex) {
    res.status(500).send({ success: false, message: ex.message });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        status: "VERIFIED"
      },
      { new: true }
    );


    return res.status(200).send({success: true, message: "Account Verified Successfully!", data: user})
  } catch (err) {
    res.status(500).send({ success: false, message: err.message})
  }
}

export const changePassword = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user._id }).select("Password");
    let validatePassword = await bcrypt.compare(
      req.body.oldPassword,
      user.Password
    );
    if (!validatePassword) return res.status(400).send("Invalid old password!");
    let newPasswordSalt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.newPassword, newPasswordSalt);

    await User.findByIdAndUpdate(
      req.user._id,
      { Password: newPassword },
      { new: true }
    );
    res
      .status(200)
      .send(
        "Password Updated Successfully! Next time Log in with your new Password"
      );
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("The user does not exist");

    await User.findByIdAndRemove(req.user._id);
    res.status(200).send("User deleted successfully");
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
