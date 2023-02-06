import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Mongo DB connection
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
//passport setup
import passport from 'passport';
app.use(passport.initialize());
require('./lib/passport');
// routes
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
app.use('/', indexRouter);
app.use('/users', passport.authenticate('jwt', { session: false }), usersRouter);
app.use('/auth', authRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
export default app;
