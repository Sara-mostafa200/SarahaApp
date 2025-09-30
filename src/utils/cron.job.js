import { deleteMany, findOne } from "../DB/db.service.js"
import { revokeTokenModel } from "../DB/models/revokeToken.model.js"

export const removeExpireToken = async()=>{
    const currentTime = Math.floor(Date.now() / 1000) 
    await deleteMany({model:revokeTokenModel , filter:{expireRefreshDate:{$lte: currentTime} , expireAccessDate:{$lte: currentTime }}})
}