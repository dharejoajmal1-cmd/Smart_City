const Feedback=require('../models/Feedback');
const ApiResponse=require('../utils/ApiResponse');
const asyncHandler=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const getPerformance=asyncHandler(async(req,res)=>{const agg=await Feedback.aggregate([{$group:{_id:null,avg:{$avg:'$rating'},count:{$sum:1},positive:{$sum:{$cond:[{$gte:['$rating',4]},1,0]}}}}]);const row=agg[0]||{avg:0,count:0,positive:0};const positiveRate=row.count?row.positive/row.count:0;const performanceIncrement=row.count?Math.min(5,Math.max(2,Math.round(positiveRate*5*100)/100)):2;res.json(new ApiResponse(200,'Admin performance calculated successfully',{averageRating:Number(row.avg||0).toFixed(2),feedbackCount:row.count,positiveFeedbackRate:Number((positiveRate*100).toFixed(2)),performanceIncrementPercent:performanceIncrement,formula:'Configurable: positive feedback contributes an increment between 2% and 5%'}));});
module.exports={getPerformance};
