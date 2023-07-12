const fast2sms = require("fast-two-sms");
const nodemailer =  require("nodemailer");
const multer = require("multer");
const multers3 = require("multer-s3");
const aws = require("aws-sdk");
const qr=require("qrcode");
require('dotenv').config();
//const {S3Client,PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");

function smsSend(otp,mobile){

    let options = {
        authorization :"oST3Je8bKsi6hGZjd9MHx047OmLrWcEDqAufIU51CnXpaBVtRPxqR3ZKJPHyWboQlOpAzstmL78j5cwS" ,
         message : `This is from SpareTrade, Your OTP code is ${otp}` , 
          numbers : [mobile]
        }

    fast2sms.sendMessage(options)
    .then((res)=>{
        // console.log("res",res)
    }).catch((err)=>{
      console.log(err);
    }) 
  }

async function sendMail(email,pass,isForget){
     let transporter = nodemailer.createTransport({
        host:"smtp.zoho.in",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
           // user:"jesus.mueller87@ethereal.email",
            user:"hi@sparetrade.in",
            pass:"wegveb-mygwep-6xowxA"
            //pass:"zT95Aax114tCZtwD1B"
        }
     })

try{
    let sub=isForget ? "SpareTrade Password changed" : "SpareTrade Registration";
     let info = await transporter.sendMail({
        from:'"SpareTrade  " <hi@sparetrade.in>',
        to:email,
        subject:sub,
        html:`<h4>${isForget ? "Your Password has been changed." : "Thank you for your registration."}<h4>
               ${isForget ? "You have successfully changed your password." : "You have successfully registered on LY3LEY."}
              <P></P>
             ${isForget ? "" : `Username:<a href="#">${email}</a> <br/>`}
             ${isForget ? "New Password" : "Password"}:<a href="#">${pass}</a>`
     });

}catch(err){
    console.log("err",err);
}
}

const s3=new aws.S3({
  region:process.env.AWS_BUCKET_REGION,
  accessKeyId:process.env.AWS_ACCESS_KEY,
  secretAccessKey:process.env.AWS_SECRET_KEY
})

const upload=()=>multer({
  storage:multers3({
    s3,
    bucket:"lybley-webapp-collection",
    metadata:function(req,file,cb){
       cb(null,{fieldName:file.fieldname});
    },
    key:async function(req,file,cb){
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,file.originalname + '-' + uniqueSuffix);
    }
  })
}) 

// const storage= multer.memoryStorage();
// const upload2=()=>multer({storage:storage});

// const upload1= async(file)=>{
//      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//      const params ={
//       Bucket:"lybley-webapp-collection",
//       Key:uniqueSuffix + file.originalname,
//       Body:file.buffer,
//       ContentType:file.mimetype
//      }
//     const sh= await s3.send(new PutObjectCommand(params));
//     const get =new GetObjectCommand(params); 
//     console.log(sh); 
// }


const QRCode = require('qrcode-generator');

function generateQRCodeFromString(stringData) {
  try {
    const qr = QRCode(0, 'L'); // Create a QRCode instance
    qr.addData(stringData); // Add the string data
    qr.make();

    const qrCodeData = qr.createDataURL(4); // Generate QR code data URL
    return qrCodeData;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

module.exports={
    smsSend,
    sendMail,
    upload,
    generateQRCodeFromString,
  }