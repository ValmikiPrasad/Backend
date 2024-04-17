// require('dotenv').config()
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';
dotenv.config({path:'./env'})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at ${process.env.PORT}` );
    })
}).catch((err)=>{
    console.log("MongoDb connection failed : ",err);
})












// function connectDB(){

// }
// connectDB()



/*
const app=express();
(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR : ",error)
            throw error
        });

        app.listen(process.env.PORT,()=>{
            console.log(`server is running at ${process.env.PORT}`)
        })
    }
    catch(err){
        console.log(err)
        throw err
    }
})()*/