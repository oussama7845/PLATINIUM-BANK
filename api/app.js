var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var costumerRouter = require('./routes/costumer');
var actionRouter = require('./routes/action');
var cardRouter = require('./routes/card');
var transactionRouter = require('./routes/transaction');
var accountRouter = require('./routes/account');



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', costumerRouter);
app.use('/', actionRouter);
app.use('/', cardRouter);
app.use('/', transactionRouter);
app.use('/', accountRouter);


module.exports = app;