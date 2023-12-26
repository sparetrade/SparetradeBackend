const express=require("express");
const router= new express.Router();
const Razorpay=require("razorpay");
const crypto=require("crypto");
const Order=require("../models/order");
const BrandModel=require("../models/brandRegistrationModel");
const Notification=require("../models/notification");
const PickupLocation=require("../models/brandPickupLocation");
const { default: axios } = require("axios");
const {customerOrderConfirmSms,brandOrderConfirmEmail,customerOrderConfirmEmail,brandOrderConfirmSms}=require("../services/service");
const fs=require("fs");
require("dotenv");

const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
//const instance = new Razorpay({ key_id: "rzp_live_aOxuRwOwtnZ9v0", key_secret: "Obz13GEJNLLX3Fch2ziVGiA0" });

const path = require('path');

const filePath = path.join(__dirname, 'token.txt');
// Simulated token refresh function (replace this with your actual token refresh logic)
function readTokenFromFile() {
   try {
     const token = fs.readFileSync(filePath, 'utf-8');
     return token.trim(); // Remove leading/trailing whitespace
   } catch (error) {
     console.error('Error reading token from file:', error);
     return null;
   }
 }

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
          try{
               let body=req.body.customerData;
               let ids=body.items.map(f1=>({id:f1.brandId,mrp:f1.MRP*f1.quantity}));
               ids.map(async (id)=>{
               let br=await BrandModel.findOne({_id:id.id});
               await BrandModel.updateOne({_id:id.id},{revenue:br.revenue+id.mrp,totalDue:br.totalDue+id.mrp});
             });
         
             let order=new Order(body);
             let order1=await order.save();
             let totalPrice = order1?.items?.map(it => ({ price: it?.MRP * it?.quantity }));
             let totalPrice1 = totalPrice?.reduce((acc, curr) => acc + curr?.price, 0);
             let length = order1?.items?.reduce((acc, curr) => acc + (+curr?.length), 0);
             let height = order1?.items?.reduce((acc, curr) => acc + (+curr?.height), 0);
             let breadth = order1?.items?.reduce((acc, curr) => acc + (+curr?.breadth), 0);
             let weight = order1?.items?.reduce((acc, curr) => acc + (+curr?.weight), 0);
             let [getId] = order1?.items;
             let brandId=getId?.brandId;
             
             let item = order1?.items?.map(it => (
               {
                 name: it?.sparePartName,
                 sku: it?.skuNo,
                 units: it?.quantity,
                 selling_price: it?.MRP,
                 discount: "",
                 tax: "",
                 hsn: 441122
               }
             ))
               ;
         
             let orderData = {
               "order_id": order1?._id,
               "order_date": new Date(order1?.createdAt)?.toLocaleString(),
               "pickup_location": "",
               "channel_id": "",
               "comment": "",
               "billing_customer_name": order1?.name,
               "billing_last_name": "",
               "billing_address": order1?.address,
               "billing_address_2": order1?.address2,
               "billing_city": order1?.city,
               "billing_pincode": order1?.pin,
               "billing_state": order1?.state,
               "billing_country": "India",
               "billing_email": order1?.email,
               "billing_phone": order1?.contact,
               "shipping_is_billing": true,
               "shipping_customer_name": "",
               "shipping_last_name": "",
               "shipping_address": "",
               "shipping_address_2": "",
               "shipping_city": "",
               "shipping_pincode": "",
               "shipping_country": "",
               "shipping_state": "",
               "shipping_email": "",
               "shipping_phone": "",
               "order_items": item,
               "payment_method": "Prepaid",
               "shipping_charges": 0,
               "giftwrap_charges": 0,
               "transaction_charges": 0,
               "total_discount": 0,
               "sub_total": totalPrice1,
               "length": +length,
               "breadth": +breadth,
               "height": +height,
               "weight": +weight
             }
     
               const currentToken = readTokenFromFile();
               let pickupLocation= await PickupLocation.findOne({userId:brandId});
               if(pickupLocation){
               let finalOrder={...orderData,pickup_location:pickupLocation.pickupLocation};
               let response=await axios.post("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",finalOrder,{headers:{'Authorization':`Bearer ${currentToken}`}});
               let {data}=response;
               res.json({status:true});
               await Order.updateOne({_id:order1?._id},{sub_total:+totalPrice1,length:+length,breadth:+breadth,height:+height,weight:+weight,shipOrderId:data.order_id,shipmentId:data.shipment_id});
               ids.map(async(id)=>{
                    let notify=new Notification({name:body.name,category:"ORDER",id:order1._id,brandId:id.id,title:"A new order created"});
                    await notify.save();
               })
               customerOrderConfirmSms(order1?.name,totalPrice1,order1?.id,order1?.contact);
               customerOrderConfirmEmail(order1?.name,totalPrice1,order1?.id,order1?.email);
               brandOrderConfirmEmail(pickupLocation?.name,totalPrice1,order1?.id,pickupLocation?.email,item);
               brandOrderConfirmSms(pickupLocation?.name,totalPrice1,order1?.id,pickupLocation?.phone);
              }else{
                 res.status(404).send("Pickup Location not found");
              }
            }catch(err){
               res.status(400).send(err.response.data);
            }
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
      res.send(data);
      }catch(err){
       res.status(400).send(err); 
      }
});

module.exports=router;