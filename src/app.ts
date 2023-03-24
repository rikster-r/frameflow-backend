import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import createError, { type HttpError } from 'http-errors';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Mongo DB connection
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//passport setup
import passport from 'passport';
app.use(passport.initialize());
import './lib/passport.js';

// routes
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
