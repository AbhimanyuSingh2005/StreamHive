import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Import Routes 

import userRouter from "./routes/user.routes.js";
import subscriptionRouter  from './routes/subscription.routes.js';
import vedioRouter from './routes/vedio.routes.js';
import frontendRouter from './routes/frontend.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';

// Use Routes

app.use('/api/v1/user',userRouter);
app.use('/api/v1/subscription',subscriptionRouter);
app.use('/api/v1/vedio',vedioRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/',frontendRouter);

export { app };