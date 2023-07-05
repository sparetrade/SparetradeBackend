const express = require("express");
require("./src/db/connection");
const user = require("./src/routers/userRegistration");
const brand = require("./src/routers/brandRegistration");
const productCategory=require("./src/routers/brandProductCategories");
const brandProducts=require("./src/routers/brandProduct");
const spareParts=require("./src/routers/spareParts");
const sparePartFault=require("./src/routers/sparePartfaults");
const addToCart=require("./src/routers/addToCart")
const videoUpload=require("./src/routers/video");
const orders=require("./src/routers/order");
const dasboard=require("./src/routers/dashboard");
const payment=require("./src/routers/payment");
const delivery=require("./src/routers/delivery");
const bankDetail=require("./src/routers/bankDetail");
const verifyReturn=require("./src/routers/verifyReturn");
const blog=require("./src/routers/blog");
const blogCategory=require("./src/routers/blogCategory");
const review=require("./src/routers/review");
const notification=require("./src/routers/notification");

const app=express();

app.use(express.json());
app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(user);
app.use(brand);
app.use(productCategory)
app.use(brandProducts);
app.use(spareParts);
app.use(sparePartFault)
app.use(addToCart)
app.use(videoUpload);
app.use(orders);
app.use(dasboard);
app.use(payment);
app.use(delivery);
app.use(bankDetail);
app.use(verifyReturn);
app.use(blog);
app.use(blogCategory);
app.use(review);
app.use(notification);

const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Listening on port and pipeline ${port}`);
});