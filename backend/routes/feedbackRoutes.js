const express=require('express');
const {protect}=require('../middleware/auth');
const {admin}=require('../middleware/admin');
const {listFeedback}=require('../controllers/feedbackController');
const {submitFeedback}=require('../controllers/inquiryController');
const router=express.Router();
router.get('/',protect,admin,listFeedback);
router.post('/inquiry/:id',protect,submitFeedback);
module.exports=router;
