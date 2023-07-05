const express=require("express");
const router= new express.Router();
const Razorpay=require("razorpay");
const crypto=require("crypto");
const { default: axios } = require("axios");
require("dotenv");

const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
//const instance = new Razorpay({ key_id: "rzp_live_aOxuRwOwtnZ9v0", key_secret: "Obz13GEJNLLX3Fch2ziVGiA0" });

router.post("/payment",async(req,res)=>{
     try{
   const order=await instance.orders.create({
        amount: (+req.body.amount)*100,
        currency: "INR",
      });
      res.send(order);
     }catch(err){
          res.status(400).send(err);
     }
});

router.post("/paymentVerification",async(req,res)=>{
     const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body.response;
     const body=razorpay_order_id + "|" + razorpay_payment_id;
     const expectedSignature=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
     const isAuthentic=expectedSignature===razorpay_signature;
     if(isAuthentic){
      res.status(200).json({status:true});
     }else{
      res.status(400).json({status:false});
     }
});

router.post("/brandDuePayment",async(req,res)=>{
      try{
        //  let paymentDetail= {
        //        "account_number":"4564568731430371",
        //        "amount":10000,
        //        "currency":"INR",
        //        "mode":"NEFT",
        //        "purpose":"payout",
        //        "fund_account":{
        //            "account_type":"bank_account",
        //            "bank_account":{
        //                "name":"Manzar Bilal",
        //                "ifsc":"SBIN0000650",
        //                "account_number":"20462883795"
        //            },
        //            "contact":{
        //                "name":"Manzar Bilal",
        //                "email":"manzarbilal0786@gmail.com",
        //                "contact":"9719125658",
        //                "type":"employee",
        //                "reference_id":"12345",
        //                "notes":{
        //                    "notes_key_1":"Tea, Earl Grey, Hot",
        //                    "notes_key_2":"Tea, Earl Grey… decaf."
        //                }
        //            }
        //        },
        //        "queue_if_low_balance":true,
        //        "reference_id":"Acme Transaction ID 12345",
        //        "narration":"Acme Corp Fund Transfer",
        //        "notes":{
        //            "notes_key_1":"Beam me up Scotty",
        //            "notes_key_2":"Engage"
        //        }
        //    }
           
      let body=req.body;
      let response = await axios.post("https://api.razorpay.com/v1/payouts",body,{headers:{Authorization:"Basic " +new Buffer.from(process.env.RAZORPAYX_KEY_ID + ":" +process.env.RAZORPAYX_KEY_SECRET ).toString("base64")}});
      let {data}=response;
      console.log(data)
      res.send(data);
      }catch(err){
       res.status(400).send(err); 
      }
});

module.exports=router;