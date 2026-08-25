const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:100},email:{type:String,required:true,trim:true,lowercase:true},phone:{type:String,trim:true,default:''},message:{type:String,required:true,trim:true,maxlength:3000},property:{type:mongoose.Schema.Types.ObjectId,ref:'Property',default:null},status:{type:String,enum:['new','contacted','closed'],default:'new'}},{timestamps:true});
module.exports=mongoose.model('ContactMessage',schema);
