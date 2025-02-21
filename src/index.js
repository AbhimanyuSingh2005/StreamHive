import dotenv from 'dotenv';
dotenv.config();
import connectDB from './db/db.js';
import {app} from './app.js';

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(`Error: ${error.message}`);
    })
    console.log("Database connected");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log(`Error: ${error.message}`);
});