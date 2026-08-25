const validator = require('validator');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const Agreement = require('../models/Agreement');
const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validateCnic = (value) => !value || /^\d{5}-?\d{7}-?\d$/.test(String(value).trim());

const submitInquiry = asyncHandler(async (req, res) => {
  const { property, name, email, phone, cnic, income, budget, plotSizeSqYds, plotType, preferredLocation, message, optionType } = req.body;
  if (!name || !email || !phone || budget === undefined || budget === '' || !message) throw new ApiError(400, 'Name, email, phone, budget and message are required');
  if (!validator.isEmail(String(email))) throw new ApiError(400, 'Please provide a valid email address');
  if (!validateCnic(cnic)) throw new ApiError(400, 'CNIC must be in 13-digit Pakistani format');
  const size = plotSizeSqYds === '' || plotSizeSqYds === undefined ? null : Number(plotSizeSqYds);
  if (size !== null && (!Number.isFinite(size) || size < 150 || size > 250)) throw new ApiError(400, 'Plot size must be between 150 and 250 Sq.Yds');
  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget < 0) throw new ApiError(400, 'Budget must be a valid number');
  if (property) {
    const exists = await Property.exists({ _id: property });
    if (!exists) throw new ApiError(404, 'Selected property was not found');
  }
  const inquiry = await Inquiry.create({
    user: req.user?._id || null, property: property || null, name, email, phone, cnic,
    income: income === '' || income === undefined ? null : Number(income), budget: numericBudget,
    plotSizeSqYds: size, plotType: plotType || 'residential', preferredLocation, message,
    optionType: optionType || 'custom',
  });
  const safe = await Inquiry.findById(inquiry._id).select('-cnic').populate('property', 'title price area type location images');
  res.status(201).json(new ApiResponse(201, 'Plot request submitted successfully', { inquiry: safe }));
});

const getAllInquiries = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { user: req.user._id };
  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).populate('property', 'title price area type location images').populate('user', 'name email phone avatar');
  res.json(new ApiResponse(200, 'Inquiries fetched successfully', { inquiries }));
});

const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).select('+cnic').populate('property').populate('user', 'name email phone avatar');
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  if (req.user.role !== 'admin' && String(inquiry.user?._id) !== String(req.user._id)) throw new ApiError(403, 'Access denied');
  res.json(new ApiResponse(200, 'Inquiry fetched successfully', { inquiry }));
});

const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(inquiry.user) !== String(req.user._id)) throw new ApiError(403, 'Access denied');
  if (isAdmin) {
    const { status, adminResponse, agreedPrice } = req.body;
    if (status && !['pending','under_review','negotiating','approved','rejected','agreement','completed'].includes(status)) throw new ApiError(400, 'Invalid inquiry status');
    if (status) inquiry.status = status;
    if (adminResponse !== undefined) inquiry.adminResponse = String(adminResponse).trim();
    if (agreedPrice !== undefined && agreedPrice !== '') inquiry.agreedPrice = Number(agreedPrice);
    if (status === 'agreement') inquiry.agreementAt = new Date();
    if (status === 'completed') inquiry.completedAt = new Date();
  }
  await inquiry.save();
  const safe = await Inquiry.findById(inquiry._id).select('-cnic').populate('property', 'title price area type location images');
  res.json(new ApiResponse(200, 'Inquiry updated successfully', { inquiry: safe }));
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  const { status } = req.body;
  const allowed = ['pending','under_review','negotiating','approved','rejected','agreement','completed'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid inquiry status');
  inquiry.status = status;
  if (status === 'agreement') inquiry.agreementAt = new Date();
  if (status === 'completed') inquiry.completedAt = new Date();
  await inquiry.save();
  const safe = await Inquiry.findById(inquiry._id).select('-cnic').populate('property', 'title price area type location images');
  res.json(new ApiResponse(200, 'Inquiry status updated successfully', { inquiry: safe }));
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  await inquiry.deleteOne();
  res.json(new ApiResponse(200, 'Inquiry deleted successfully', {}));
});

const completeDeal = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  if (req.user.role !== 'admin') throw new ApiError(403, 'Admin privileges required');
  if (inquiry.status !== 'agreement' && inquiry.status !== 'approved') throw new ApiError(400, 'Inquiry must be approved or in agreement before completion');
  const price = inquiry.agreedPrice || inquiry.budget;
  const property = inquiry.property ? await Property.findById(inquiry.property).select('price') : null;
  const agreement = await Agreement.findOneAndUpdate({ inquiry: inquiry._id }, {
    inquiry: inquiry._id, user: inquiry.user, property: inquiry.property || null,
    originalPrice: property?.price || null, negotiatedPrice: price,
    plotSizeSqYds: inquiry.plotSizeSqYds || 150, plotType: inquiry.plotType || 'residential', status: 'completed', completedAt: new Date(),
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  inquiry.status = 'completed'; inquiry.completedAt = new Date(); await inquiry.save();
  if (inquiry.property) await Property.findByIdAndUpdate(inquiry.property, { status: 'sold' });
  res.json(new ApiResponse(200, 'Deal completed successfully', { agreement }));
});

const submitFeedback = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry || String(inquiry.user) !== String(req.user._id)) throw new ApiError(404, 'Completed purchase not found');
  if (inquiry.status !== 'completed') throw new ApiError(400, 'Feedback is available only after a completed deal');
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5');
  const existing = await Feedback.findOne({ inquiry: inquiry._id });
  if (existing) throw new ApiError(409, 'Feedback has already been submitted');
  const feedback = await Feedback.create({ inquiry: inquiry._id, user: req.user._id, rating, comment: req.body.comment || '' });
  res.status(201).json(new ApiResponse(201, 'Feedback submitted successfully', { feedback }));
});

module.exports = { submitInquiry, getAllInquiries, getInquiry, updateInquiry, updateInquiryStatus, deleteInquiry, completeDeal, submitFeedback };
