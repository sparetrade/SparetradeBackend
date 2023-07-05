const moongoose=require("mongoose");

const sparePartSchema= new moongoose.Schema({
    userId:{type:String,required:true},
    productId:{type:String,required:true},
    skuNo:{type:String},
    length:{type:String},
    breadth:{type:String},
    height:{type:String},
    weight:{type:String},
    brandName:{type:String},
    MRP:{type:Number,required:true},
    bestPrice:{type:Number,required:true},
    description:{type:String,required:true},
    partName:{type:String,required:true},
    category:{type:String,required:true},
    productModel:{type:String,required:true},
    partNo:{type:String,required:true},
    faultType:{type:Array,required:true},
    technician:{type:Number,required:true},
    images:{type:Array,required:true},
    qrcode:{type:String}
},{timestamps:true});

const sparePartModel=new moongoose.model("sparePart",sparePartSchema);

module.exports=sparePartModel;