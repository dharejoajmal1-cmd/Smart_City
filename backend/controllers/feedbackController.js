const Feedback=require('../models/Feedback');
const ApiResponse=require('../utils/ApiResponse');
const asyncHandler=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const listFeedback=asyncHandler(async(req,res)=>{
 const feedback=await Feedback.find().sort({createdAt:-1}).populate('user','name avatar').populate('inquiry','agreedPrice plotSizeSqYds plotType');
 res.json(new ApiResponse(200,'Feedback fetched successfully',{feedback}));
});
module.exports={listFeedback};
