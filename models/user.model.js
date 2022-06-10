import mongoose from "mongoose"
const { Schema, model }= mongoose

import jsonwebtoken from 'jsonwebtoken'
const {sign} = jsonwebtoken

const userSchema = new Schema({
    Names:{
        type:String,
        minLength:5,
        required:true
    },

    Email:{
        type:String,
        required:true
    },
    
    Gender:{
        type: String,
        enum:['MALE','FEMALE'],
        required: true
    },
    Age:{
        type:Number,
        required:true
    },
    dob:{
        type: Date,
        required:true
    },
    MaritialStatus:{
        type: String,
        enum:['SINGLE','DIVORCED','MARRIED','WIDOWED'],
        required: true
    },
    Nationality: {
        type: String,
        required: true
    },

    profilePicture:{
        type:String,
        default:'https://res.cloudinary.com/code-ama/image/upload/v1631563998/defaultProfile_tslvta.jpg'
    },
  
    Password:{
        type:String,
        minLength:6,
        required:true
    },
   
    profilePicture_cloudinary_id: {
        type: String,
        default: ""
    },
    AccountType:{
        type:String,
        enum:['user', 'admin'],
        required: true
    },
    LastLoggedIn:{
        type: Date,
        default: null
    },
    verificationCode:{
        type:String,
        unique: true,
        required: true    
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    passwordResetCode:{
        type: Object,
        default: null
    },
    requestPasswordReset:{
        type: Boolean,
        default: false
    },
    CreatedAt:{
        type:Date,
        default:null
    }
})

userSchema.methods.generateAuthToken = function(){
    const token = sign(
        {_id:this._id,AccountType: this.AccountType},
        (process.env.JWT).trim()
    )
    return 'Bearer '+token
}

export const User = model('user',userSchema)
