require('dotenv').config();
const xmlRouter = require('./routes/xmlRoute')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./config/dbConn')

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors());

app.use('/api',xmlRouter)

// Error Handling
app.use((err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    
    res.status(err.statusCode).json({
        message:res.message
    })
    
    });

app.listen(3000, ()=>{
    console.log('Server is Running on PORT 3000')
})

