import { Router } from "express";
import * as MessageServices from './message.services.js'
import * as MessageValidation from './message.validation.js'
import { Validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post('/send/:receiverId' , Validation(MessageValidation.sendMessageSchema) , MessageServices.sendMessage );

router.get('/messages' , MessageServices.findMessages );


export default router;
