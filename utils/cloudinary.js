import { v2 as cloudinary } from 'cloudinary'

const cloud_name= (process.env.CLOUDINARY_CLOUD_NAME).toString().trim()
const api_key = (process.env.CLOUDINARY_API_KEY).toString().trim()
const api_secret= process.env.CLOUDINARY_API_SECRET

cloudinary.config({
    cloud_name: ''+cloud_name,
    api_key: ''+api_key,
    api_secret: ''+api_secret,
})

export default cloudinary;