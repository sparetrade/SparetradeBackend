const mongoose=require("mongoose");

const brandSchema= new mongoose.Schema({
    brandName:{type:String,required:true},
    email:{type:String,required:true},
    contact:{type:Number,required:true},
    password:{type:String,required:true},
    gstNo:{type:String,required:true},
    gstDocument:{type:String,required:true},
    address:{type:String},
    aboutUs:{type:String},
    brandLogo:{type:String},
    brandBanner:{type:String},
    otp:{type:String},
    totalPay:{type:Number,default:0},
    totalDue:{type:Number,default:0},
    revenue:{type:Number,default:0},
    status:{type:String,default:"INACTIVE"},
    approval:{type:String,default:"DISAPPROVED"},
    role:{type:String,default:"BRAND"}
},{timestamps:true});

const BrandModel = new mongoose.model("brand",brandSchema);

module.exports=BrandModel;