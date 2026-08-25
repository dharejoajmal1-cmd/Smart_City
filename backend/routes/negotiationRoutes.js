const express=require('express');
const {protect}=require('../middleware/auth');
const {listMessages,sendMessage}=require('../controllers/negotiationController');
const router=express.Router();
router.get('/:inquiryId/messages',protect,listMessages);
router.post('/:inquiryId/messages',protect,sendMessage);
module.exports=router;
