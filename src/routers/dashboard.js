const express=require("express");
const router=new express.Router();
const Customers=require("../models/userRegistrationModel");
const Orders=require("../models/order");
const SpareParts=require("../models/sparePartsModel");
const Brand =require("../models/brandRegistrationModel")

router.get("/dashboardDetails",async(req,res)=>{
     try{
          let customer=await Customers.find({});
          let order=await Orders.find({});
          let sparePart=await SpareParts.find({});
          let brand=await Brand.find({})
          res.json({
            totalCustomers:customer,
            totalBrands:brand,
            orders:order,
            sparParts:sparePart,
          });
     }catch(err){
          res.status(400).send(err);
     }
});

module.exports=router;