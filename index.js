
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const EmployeeModel = require('./model/Employee')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
// const session = require('express-session')
const TicketModel = require('./model/TicketModel')
const UserModel = require('./model/UserModel')
const multer = require('multer')
const path = require('path')
const dotenv = require('dotenv')


const app = express()
dotenv.config();

app.use(express.json())

app.use(cors({
    origin:["http://localhost:3000"],
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials:true
}))

app.use(cookieParser())
app.use(express.static('public'))

// mongoose.connect('mongodb://127.0.0.1:27017/CRM')
const connect = async () =>{
    try{
await mongoose.connect(process.env.MONGO, {dbName:'CRM-db'})
console.log('mongo connected')
    }catch (err){
console.log(err)
    }

}


//127.0.0.1:27017

const verifyUser = (req, res, next) =>{
const token = req.cookies.token;
if(!token){
    return res.json('The token is missing')
}else{
    jwt.verify(token,'jwt-secret-key', (err, decoded) =>{
        if(err){
            return res.json("the token is wrong")
        }else{
            req.email = decoded.email
            req.name = decoded.name
            next()
        }
    })
}
}

app.get('/', verifyUser,  (req, res)=>{
return res.json({email:req.email , name:req.name})
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, response) => {
                    if (response) {
                        const token = jwt.sign({ email: user.email, role: user.role, name:user.name },
                            "jwt-secret-key", { expiresIn: '1d' })
                            res.cookie('token', token)
                           
                            return res.json({Status:'Success', role:user.role})                                                                                                              
                    } else {

                        return res.json('The passowrd is incorrect')
                    }
                })

            } else {
                res.json("No record existed")
            }
        })
})

const storage = multer.diskStorage({
    destination:(req, file , cb)=> {
        cb(null, 'public\Images')
    },
    filename:(req, file, cb)=> {
        cb(null, file.fieldname+ "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage:storage})

app.post('/createticket', verifyUser, upload.single('file'), (req, res)=>{
   console.log(req.file)
    // const {subject, description, category} = req.body
    TicketModel.create({title: req.body.title, 
        description:req.body.description,
        file:req.body.file,
        status:req.body.status,
    email:req.body.email})
    .then(result => res.json("Success") )
    
    .catch(err =>res.json(err))
})

app.post('/adduser' , verifyUser , (req,res)=>{
    UserModel.create({leadname:req.body.leadname,
    department:req.body.department,
    status:req.body.status,
    email:req.body.email})
    .then(result => res.json('Success'))
    .catch(err => res.json(err))

})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10)
        .then(hash => {
            EmployeeModel.create({ name, email, password: hash })
                .then(employees => res.json('Success'))
                .catch(err => res.json(err))
        }).catch(err => res.json(err))

})

app.get('/gettickets', (req, res)=>{
    TicketModel.find()
    .then(tickets => res.json(tickets))
    .catch(err => res.json(err))
})

app.get('/getusers', (req, res)=>{
    UserModel.find()
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/getticketbyid/:id', (req, res)=>{
    const id = req.params.id
    TicketModel.findById({_id: id})
    .then(ticket => res.json(ticket))
    .catch(err => res.json(err))
})

app.get('/getuserbyid/:id', (req, res)=>{
    const id = req.params.id
    UserModel.findById({_id: id})
    .then(user => res.json(user))
    .catch(err => res.json(err))
})

app.put('/editticket/:id', (req,res)=>{
    const id = req.params.id;
TicketModel.findByIdAndUpdate({_id:id},
   {title: req.body.title,
     description:req.body.description})
     .then(result => res.json('Success'))
     .catch(err=> res.json(err))

})

app.delete('/deleteticket/:id',(req, res)=>{
    TicketModel.findByIdAndDelete({_id:req.params.id})
    .then(result => res.json('Success'))
    .catch(err=> res.json())
})

app.delete('/deleteuser/:id',(req, res)=>{
    UserModel.findByIdAndDelete({_id:req.params.id})
    .then(result => res.json('Success'))
    .catch(err=> res.json())
})

app.get('/logout',(req, res)=>{
    res.clearCookie('token')
    return res.json("Success")
})



app.listen(process.env.PORT, () => {
    connect();
    console.log("server connected  YAYYY!!");
  });