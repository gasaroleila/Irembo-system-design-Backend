import mongoose from "mongoose"
const { Schema, model }= mongoose

import jsonwebtoken from 'jsonwebtoken'
const {sign} = jsonwebtoken

const userSchema = new Schema({
    names:{
        type:String,
        minLength:5,
        required:true
    },

    email:{
        type:String,
        required:true
    },
    
    gender:{
        type: String,
        enum:['MALE','FEMALE'],
        required: true
    },
    age:{
        type:Number,
        required:true
    },
    dob:{
        type: Date,
        required:true
    },
    maritialStatus:{
        type: String,
        enum:['SINGLE','DIVORCED','MARRIED','WIDOWED'],
        required: true
    },
    nationality: {
        type: String,
        required: true
    },

    profilePicture:{
        type:String,
        default:'https://res.cloudinary.com/code-ama/image/upload/v1631563998/defaultProfile_tslvta.jpg'
    },

    password:{
        type:String,
        minLength:6,
        required:true
    },

    profilePicture_cloudinary_id: {
        type: String,
        default: ""
    },
    accountType:{
        type:String,
        enum:['user', 'admin'],
        required: true
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
    }
}, { timestamps: true })

userSchema.methods.generateAuthToken = function(){
    const token = sign(
        {_id:this._id,AccountType: this.AccountType},
        (process.env.JWT).trim()
    )
    return 'Bearer '+token
}

export const User = model('user',userSchema)
