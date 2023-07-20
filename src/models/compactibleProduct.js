const moongoose=require("mongoose");

const compactibleSchema= new moongoose.Schema({
    userId:{type:String,required:true},
    skuNo:{type:String},
    length:{type:String},
    breadth:{type:String},
    height:{type:String},
    weight:{type:String},
    brandName:{type:String},
    seller:{type:String},
    MRP:{type:Number,required:true},
    bestPrice:{type:Number,required:true},
    description:{type:String,required:true},
    partName:{type:String,required:true},
    compactibleWith:{type:String,required:true},
    partNo:{type:String,required:true},
    faultType:{type:Array,required:true},
    images:{type:Array,required:true},
    qrcode:{type:String}
},{timestamps:true});

const compactibleModel=new moongoose.model("compactible",compactibleSchema);

module.exports=compactibleModel;