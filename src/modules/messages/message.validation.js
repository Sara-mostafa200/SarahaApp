import Joi from"joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const sendMessageSchema = {
    params:Joi.object({
     receiverId: generalFields.id.required()
    })
}