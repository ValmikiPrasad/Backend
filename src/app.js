import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()
// app.use(cors())

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) //server can use the client's browser cookie to perform CRUD on it;


    

export {app}