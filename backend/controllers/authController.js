const crypto = require('crypto');
const validator = require('validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendMail } = require('../services/emailService');
const asyncHandler = (fn) => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);

const register = asyncHandler(async (req,res)=>{
  const {name,email,password,phone}=req.body;
  if(!name||!email||!password) throw new ApiError(400,'Name, email, and password are required');
  const normalizedName=validator.trim(String(name));
  const normalizedEmail=String(email).trim().toLowerCase();
  const normalizedPhone=phone?String(phone).trim():'';
  if(!validator.isLength(normalizedName,{min:2,max:50})) throw new ApiError(400,'Name must be between 2 and 50 characters');
  if(!validator.isEmail(normalizedEmail)) throw new ApiError(400,'Please provide a valid email address');
  if(!validator.isLength(password,{min:6})) throw new ApiError(400,'Password must be at least 6 characters long');
  if(normalizedPhone&&!validator.isMobilePhone(normalizedPhone,'any')) throw new ApiError(400,'Please provide a valid phone number');
  const adminEmail=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  if(adminEmail&&normalizedEmail===adminEmail) throw new ApiError(403,'This email address is reserved for the administrator');
  const existing=await User.findOne({email:normalizedEmail});
  if(existing) throw new ApiError(409,'An account with this email already exists');
  const user=await User.create({name:normalizedName,email:normalizedEmail,password,phone:normalizedPhone,role:'user'});
  const token=generateToken(res,user._id);
  // Fire-and-forget: don't let a slow/broken mail server block or fail registration.
  sendWelcomeEmail(user).catch(()=>{});
  res.status(201).json(new ApiResponse(201,'User registered successfully',{user,token}));
});

const login = asyncHandler(async(req,res)=>{
  const {email,password}=req.body;
  if(!email||!password) throw new ApiError(400,'Email and password are required');
  const normalizedEmail=String(email).trim().toLowerCase();
  if(!validator.isEmail(normalizedEmail)) throw new ApiError(400,'Please provide a valid email address');
  const user=await User.findOne({email:normalizedEmail}).select('+password');
  if(!user) throw new ApiError(401,'Invalid email or password');
  const ok=await user.comparePassword(password);
  if(!ok) throw new ApiError(401,'Invalid email or password');
  const configuredAdmin=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  if(user.role==='admin' && configuredAdmin && normalizedEmail!==configuredAdmin) throw new ApiError(403,'This administrator account is not authorized to log in here');
  if(normalizedEmail===configuredAdmin && user.role!=='admin') throw new ApiError(403,'Administrator account is not configured correctly. Run the admin setup command.');
  const token=generateToken(res,user._id);
  user.password=undefined;
  res.json(new ApiResponse(200,'Login successful',{user,token}));
});

const logout=asyncHandler(async(req,res)=>{res.cookie('token','',{httpOnly:true,expires:new Date(0)});res.json(new ApiResponse(200,'Logged out successfully',{}));});
const getMe=asyncHandler(async(req,res)=>{const user=await User.findById(req.user._id);if(!user) throw new ApiError(404,'User not found');res.json(new ApiResponse(200,'Current user fetched successfully',{user}));});

const forgotPassword=asyncHandler(async (req,res)=>{
 const email=String(req.body.email||'').trim().toLowerCase();
 if(!validator.isEmail(email)) throw new ApiError(400,'Please provide a valid email address');
 const user=await User.findOne({email}).select('+passwordResetTokenHash +passwordResetExpires');
 // Always generic to avoid account enumeration.
 if(!user) return res.json(new ApiResponse(200,'If an account exists, a reset link has been sent to that email.',{}));
 const raw=crypto.randomBytes(32).toString('hex');
 user.passwordResetTokenHash=crypto.createHash('sha256').update(raw).digest('hex');
 user.passwordResetExpires=new Date(Date.now()+15*60*1000);
 await user.save({validateBeforeSave:false});
 const resetLink=`${process.env.CLIENT_URL||'http://localhost:5173'}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
 await sendMail({
   to:email,
   subject:'Reset your Smart City Jamshoro password',
   html:`
     <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;line-height:1.6">
       <h2 style="color:#0f2f4f;">Password Reset Request</h2>
       <p>Hi ${user.name||''},</p>
       <p>We received a request to reset your Smart City Jamshoro account password. This link expires in 15 minutes.</p>
       <p>
         <a href="${resetLink}"
            style="display:inline-block;padding:10px 18px;background:#0f2f4f;color:#fff;
                   text-decoration:none;border-radius:6px;">
           Reset Password
         </a>
       </p>
       <p style="font-size:13px;color:#666">If you did not request this, you can safely ignore this email.</p>
     </div>
   `,
 }).catch(()=>{});
 // Development-only convenience: never expose the raw link in production responses/logs.
 const devLink=process.env.NODE_ENV==='production'?undefined:resetLink;
 res.json(new ApiResponse(200,'If an account exists, a reset link has been sent to that email.',{resetLink:devLink}));
});

const resetPassword=asyncHandler(async(req,res)=>{
 const {token,email,newPassword}=req.body;
 if(!token||!email||!newPassword) throw new ApiError(400,'Email, reset token and new password are required');
 if(!validator.isLength(newPassword,{min:6})) throw new ApiError(400,'New password must be at least 6 characters long');
 const hash=crypto.createHash('sha256').update(String(token)).digest('hex');
 const user=await User.findOne({email:String(email).trim().toLowerCase()}).select('+passwordResetTokenHash +passwordResetExpires');
 if(!user||user.passwordResetTokenHash!==hash||!user.passwordResetExpires||user.passwordResetExpires<new Date()) throw new ApiError(400,'Reset link is invalid or expired');
 user.password=newPassword;user.passwordResetTokenHash='';user.passwordResetExpires=null;await user.save();
 res.json(new ApiResponse(200,'Password reset successfully',{}));
});

module.exports={register,login,logout,getMe,forgotPassword,resetPassword};
