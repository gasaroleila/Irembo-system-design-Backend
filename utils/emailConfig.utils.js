import { createTransport } from "nodemailer"

export async function sendEmail(to,subject,html){
    let transporter = createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        service:"gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await new Promise((resolve, reject) => {
        //verify connection configuration
        transporter.verify(function(error, success) {
            if(error){
                console.log(error)
                reject(error)
            }
            else{
                // console.log("Server is ready to take messages")
                resolve(success)
            }
        })
    })
    
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    }

    let res = await new Promise((resolve, reject) => {
        //send mail
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                reject(err)
            } else {
                console.log(info);
                resolve(info);
            }
        })
    })

    return res;
}
