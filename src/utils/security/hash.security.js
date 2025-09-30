import  bcrypt from 'bcryptjs';

export const generateHash = ({plaintext= "" , round = process.env.SALT_ROUND}) => {
 return bcrypt.hashSync( plaintext , parseInt(round))
}

export const compareHash = async ({plaintext = "" , hashValue =""} = {}) => {
 return bcrypt.compareSync(plaintext , hashValue)
}