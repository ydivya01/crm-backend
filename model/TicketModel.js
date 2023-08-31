const mongoose= require('mongoose')

const TicketSchema = new mongoose.Schema({
    title:String,
    description:String,
    file:String,
    status:String,
    email:String
   
  
})

const TicketModel = mongoose.model('tickets', TicketSchema)
module.exports= TicketModel