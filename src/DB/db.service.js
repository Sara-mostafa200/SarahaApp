

export const findOne = async({model, filter = {} , select = "" }) => {
    return await model.findOne(filter).select(select)
}

export const findById = async({model , id = "" , select = ""}={})=>{
 return await model.findById(id).select(select)
}

export const updateOne = async({model, filter = {} , data = {} ,options = {runValidators:true} } = {}) => {
    return await model.updateOne(filter , data , options)
}

export const create = async({model , data = {} , select = "" })=>{
    return await model.create([data])
}

export const findOneAndUpdate = async({model, filter = {} , data = {} ,options = {runValidators:true , new:true} , select= "" , populate = []} = {}) => {
    return await model.findOneAndUpdate(filter , data , options).select(select).populate(populate)
}

export const deleteOne = async({model, filter = {} , session } = {}) => {
    return await model.deleteOne(filter , {session})
}

export const deleteMany = async({model , filter = {} , session } = {}) =>{
    return await model.deleteMany(filter , {session})
}  