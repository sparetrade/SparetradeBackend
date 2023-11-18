const express=require("express");
const router=new express.Router();
const VerifyReturn=require("../models/productReturnVerify");
const {upload}=require("../services/service")
const Stock = require("../models/stock")
const Exchange=require("../models/exchange");

router.post("/verifyReturnOrder",upload().single("video"),async(req,res)=>{
       let body=req.body;
       try{
        let video=req.file.location;
        let body1={...body,video:video};
        let data=new VerifyReturn(body1);
        let data1=await data.save();
        res.json({status:true,msg:"Uploaded"});
       }catch(err){
        res.status(400).send(err);
       }
});

router.get("/getReturnVerify/:id",async(req,res)=>{
       let id=req.params.id;
       try{
        let data=await VerifyReturn.findOne({orderId:id});
        res.send(data);
       }catch(err){
        res.status(400).send(err);
       }
});

router.get("/getReturnVerifyByBrand/:id",async(req,res)=>{
    let id=req.params.id;
    try{
     let data=await VerifyReturn.find({brandId:id});
     res.send(data);
    }catch(err){
     res.status(400).send(err);
    }
});

router.patch("/updateReturnVerify/:id",async(req,res)=>{
    let _id=req.params.id;
    let body=req.body;
    try{
     let data=await VerifyReturn.findByIdAndUpdate(_id,body);
     res.json({status:true,msg:"Verified"});
    }catch(err){
     res.status(400).send(err);
    }
});

router.get('/api/stocks/:stockName', async (req, res) => {
    const stockName = req.params.stockName;
    try {
       const stock = await Stock.findOne({ name: stockName });
      if (!stock) {
        return res.status(404).send('Stock not found');
      }
  
      const newPrice = stock.price + (Math.random() - 0.5) * 5;
      stock.price = newPrice;
  
      await stock.save();
  
      res.json({ name: stock.name, price: stock.price });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
  });

 router.get('/all/stocks', async (req, res) => {
    try {
      const stock = await Stock.find({});
      res.send(stock);
    } catch (err) {
      res.status(500).send('Error');
    }
  });

const API_KEY="FDAB8705-CEAA-4A23-8A5B-6CC30B8D44D9"

const headers={
    headers:{
        "X-CoinAPI-Key":API_KEY
    }
} 

router.get("/get-exchanges",async(req,res)=>{
      try{
         const response = await axios.get("https://rest.coinapi.io/v1/exchanges",headers);
         const {data}=response;

         const iconsResponse = await axios.get('https://rest.coinapi.io/v1/exchanges/icons/32',headers);
         const iconsData = iconsResponse.data;

         data.forEach(element => {
            const icon=iconsData.find(ic=> ic.exchange_id===element.exchange_id);
            if(icon){
                element.iconUrl=icon.url;
            }
         });
         
         await Exchange.deleteMany({})
         await Exchange.insertMany(data);
         
         res.status(200).send("Updated");
      }catch(err){
        res.status(500).send(err);
      }
});

router.get("/get-exchanges-list",async(req,res)=>{
    try{
        const page = +req.query.page || 1;
        const name= req.query.name;
        const limit = +req.query.limit || 10;
        const startIndex = (page -1) * limit;

        let query = {};
        if (name && name !== 'undefined') {
            query = { name: { $regex: new RegExp(name, "i") } }; // Search by name case-insensitive
        }

       const data = await Exchange.find(query).sort({volume_1day_usd:-1}).skip(startIndex).limit(limit);
       
       res.status(200).send(data);
    }catch(err){
      res.status(500).send(err);
    }
});

module.exports=router;


