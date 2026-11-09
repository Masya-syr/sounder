//extensions
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


//config
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

//routes
// app.use('/api', router);

// app.use(errorMiddleware);

//start server
const start = async () => {
    try{
        // await mongoose.connect(process.env.MONGODB_URI);
        // console.log('Connected to MongoDB');
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

start();