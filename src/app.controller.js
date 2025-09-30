import path from 'node:path'
import express from 'express';
import cors from 'cors'
import cron from 'node-cron';
import helmet from 'helmet';
import connectionDB from './DB/connection.db.js';
import authController from './modules/auth/auth.controller.js';
import userController from './modules/user/user.controller.js';
import messageController from './modules/messages/message.controller.js'
import { globalErrorHandler } from './utils/response.js';
import { removeExpireToken } from './utils/cron.job.js';
import { limiter } from './middleware/rate-limiter.middleware.js';

const bootstrap = async() =>{
const app = express();
const port = process.env.PORT || 5001;


//   convert buffer data
app.use(express.json());



//start connection db
connectionDB() 

app.use(cors())
app.use(helmet())

cron.schedule('0 0 * * *' , removeExpireToken )
// rate limiter 
app.use(limiter)

//Routing
app.use('/uploads' , express.static(path.resolve('./src/uploads')))

app.use('/auth' , authController)

app.use('/user' , userController)

app.use('/message' , messageController)


app.all("{/*dummy}" , (req , res , next)=>{
    return res.status(404).json({message:" api not found "})
})

app.use(globalErrorHandler)

app.listen(port , (e)=>{
    e && console.log({error:"an error from server on port 3000"});
    console.log(`server is running on port ${port}`)
})

}

export default bootstrap