const express=require("express");
const router=new express.Router();
const axios=require("axios");
const Order=require("../models/order");
const fs=require("fs")

const token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaXYyLnNoaXByb2NrZXQuaW4vdjEvZXh0ZXJuYWwvYXV0aC9sb2dpbiIsImlhdCI6MTY5NzExMDkzNiwiZXhwIjoxNjk3OTc0OTM2LCJuYmYiOjE2OTcxMTA5MzYsImp0aSI6IlplM1M2ZXJXUm02V2VENnMiLCJzdWIiOjM1OTEyMTcsInBydiI6IjA1YmI2NjBmNjdjYWM3NDVmN2IzZGExZWVmMTk3MTk1YTIxMWU2ZDkifQ.ngrbQwIIDrsFxTeIHepeJFeqsiTvLsVwNeAi1KhsGoE";

// "id": 3591217,
// "first_name": "API",
// "last_name": "USER",
// "email": "help@sparetrade.in",
// "company_id": 278522,
const cron = require('node-cron');
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

 const getToken=async()=>{
     try{
      let body={email:"help@sparetrade.in",password:"Sparetrade@12"};
      let response= await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login",body);
      let {data}=response
      return data.token;
     }catch(err){
      console.log("Error occured");
     }
 }
 async function updateTokenInFile() {
     const updatedToken = await getToken();
     fs.writeFileSync(filePath, updatedToken);
 }

function refreshToken() {
 updateTokenInFile();
}

// Define a schedule to run the refreshToken function every 10 days
cron.schedule('0 0 */9 * *', () => {
  refreshToken();
});

router.post("/createDeliveryOrder",async(req,res)=>{
       try{
          let body=req.body;
          const currentToken = readTokenFromFile();
          let response=await axios.post("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",body,{headers:{'Authorization':`Bearer ${currentToken}`}});
          let {data}=response;
          console.log(data);
          await Order.updateOne({_id:body.order_id},{shipOrderId:data.order_id,shipmentId:data.shipment_id});
          res.send(data);
       }catch(err){
          res.status(400).send(err.response.data);
       }
});
router.get("/trackOrder/:id",async(req,res)=>{
   try{
      let body=req.body;
      const currentToken = readTokenFromFile();
      let id =req.params.id
      let response=await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${id}`,{headers:{'Authorization':`Bearer ${currentToken}`}});
      let {data}=response;
      res.send(data);
   }catch(err){
      res.status(400).send(err.response.data);
   }
});

router.get("/getAllReturns",async(req,res)=>{
   try{
      const currentToken = readTokenFromFile();
    let data=await axios.get("https://apiv2.shiprocket.in/v1/external/orders/processing/return",{headers:{'Authorization':`Bearer ${currentToken}`}});
    res.send(data.data);
   }catch(err){
      console.log(err);
   }
});

router.get("/getSpecificOrder/:id",async(req,res)=>{
   try{
      let id =req.params.id
      const currentToken = readTokenFromFile();
      let response=await axios.get(`https://apiv2.shiprocket.in/v1/external/orders/show/${id}`,{headers:{'Authorization':`Bearer ${currentToken}`}});
      let {data}=response;
      res.send(data);
   }catch(err){
      res.status(400).send(err.response.data);
   }
});

router.post("/cancelOrder",async(req,res)=>{
   try{
      let body=req.body;
      const currentToken = readTokenFromFile();
      let response=await axios.post("https://apiv2.shiprocket.in/v1/external/orders/cancel",body,{headers:{'Authorization':`Bearer ${currentToken}`}});
      let {data}=response;
      res.send(data);
   }catch(err){
      res.status(400).send(err.response.data);
   }
});
router.post("/returnOrder",async(req,res)=>{
   try{
      let body=req.body;
      const currentToken = readTokenFromFile();
      let response=await axios.post("https://apiv2.shiprocket.in/v1/external/orders/create/return",body,{headers:{'Authorization':`Bearer ${currentToken}`}});
      let {data}=response;
      res.send(data);
   }catch(err){
      res.status(400).send(err.response.data);
   }
});
module.exports=router;
