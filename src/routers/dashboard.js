const express=require("express");
const router=new express.Router();
const Customers=require("../models/userRegistrationModel");
const Orders=require("../models/order");
const SpareParts=require("../models/sparePartsModel");
const Brand =require("../models/brandRegistrationModel")

router.get("/dashboardDetails", async (req, res) => {
     try {
       const [customer, order, sparePart, brand] = await Promise.all([
         Customers.find({}),
         Orders.find({}),
         SpareParts.find({}),
         Brand.find({}),
       ]);
   
       res.json({
         totalCustomers: customer,
         totalBrands: brand,
         orders: order,
         sparParts: sparePart,
       });
     } catch (err) {
       res.status(500).send(err); // Change the status code to 500 for server error
     }
   });

module.exports=router;