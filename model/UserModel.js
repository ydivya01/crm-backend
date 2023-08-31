const mongoose= require('mongoose')

const UserSchema = new mongoose.Schema({
    leadname:String,
    department:String,
    status:String,
    email:String
   
  
})

const UserModel = mongoose.model('users', UserSchema)
module.exports= UserModel