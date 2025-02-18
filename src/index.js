import dotenv from 'dotenv'
import express from "express";
import connectDB from './db/db.js';

dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT, () =>{
    console.log(`Server is running on port ${process.env.PORT}`);
});