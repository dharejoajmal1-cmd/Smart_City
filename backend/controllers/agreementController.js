const Agreement=require('../models/Agreement');
const ApiError=require('../utils/ApiError');
const ApiResponse=require('../utils/ApiResponse');
const asyncHandler=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const listAgreements=asyncHandler(async(req,res)=>{
 const filter=req.user.role==='admin'?{}:{user:req.user._id};
 const agreements=await Agreement.find(filter).sort({createdAt:-1}).populate('user','name email phone avatar').populate('property','title price area type location images');
 res.json(new ApiResponse(200,'Agreements fetched successfully',{agreements}));
});
const getAgreement=asyncHandler(async(req,res)=>{
 const agreement=await Agreement.findById(req.params.id).populate('user','name email phone avatar').populate('property');
 if(!agreement) throw new ApiError(404,'Agreement not found');
 if(req.user.role!=='admin' && String(agreement.user._id)!==String(req.user._id)) throw new ApiError(403,'Access denied');
 res.json(new ApiResponse(200,'Agreement fetched successfully',{agreement}));
});
module.exports={listAgreements,getAgreement};
