import { EventEmitter } from 'events';
import { sendEmail } from '../Email/send.email.js';
export const emailEvent = new EventEmitter();

emailEvent.on('sendConfirmEmail' ,async ({email = '' , subject = "confirm email" , html  })=>{
     await sendEmail({
        to: email,
        subject,
        html,
      });
})

emailEvent.on('forgotPassword' ,async ({email = '' , subject = "forgot password" , html  })=>{
     await sendEmail({
        to: email,
        subject,
        html,
      });
})