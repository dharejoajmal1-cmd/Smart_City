const validator = require('validator');
const NegotiationMessage = require('../models/NegotiationMessage');
const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = (fn) => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const getAuthorizedInquiry = async (req, id) => {
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  if (req.user.role !== 'admin' && String(inquiry.user) !== String(req.user._id)) throw new ApiError(403, 'Access denied');
  return inquiry;
};
const listMessages = asyncHandler(async (req,res)=>{
  await getAuthorizedInquiry(req, req.params.inquiryId);
  const messages = await NegotiationMessage.find({ inquiry: req.params.inquiryId }).sort({ createdAt: 1 }).populate('sender','name email role avatar');
  res.json(new ApiResponse(200,'Negotiation messages fetched successfully',{messages}));
});
const sendMessage = asyncHandler(async (req,res)=>{
  const inquiry = await getAuthorizedInquiry(req, req.params.inquiryId);
  const message = String(req.body.message || '').trim();
  if (!validator.isLength(message,{min:1,max:3000})) throw new ApiError(400,'Message is required');
  if (!['pending','under_review','negotiating','approved','agreement'].includes(inquiry.status)) throw new ApiError(400,'Negotiation is not active for this request');
  if (inquiry.status === 'pending' || inquiry.status === 'under_review') inquiry.status='negotiating';
  await inquiry.save();
  const created = await NegotiationMessage.create({ inquiry: inquiry._id, sender: req.user._id, message });
  const populated = await created.populate('sender','name email role avatar');
  res.status(201).json(new ApiResponse(201,'Message sent successfully',{message:populated}));
});
module.exports={listMessages,sendMessage};
