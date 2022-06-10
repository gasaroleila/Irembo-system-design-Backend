import multer, { diskStorage } from "multer"

export function uploadFile(destination){
    const storage = diskStorage({})

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg' || file.mimetype==='image/png'){
            cb(null,true)
        }
        else{
            cb("File Type not supported",false)
        }
    }

    const upload = multer({
        storage:storage,
        limits:{
            fileSize:1024 * 1024 * 5
        },
        fileFilter: fileFilter
    })

    return upload
}
