// calling express library 
const express = require('express');

const app = express();

// logging APIS
const morgan = require('morgan');
// mongoose library for mongoDB Connection
const mongoose = require('mongoose');
// Controllers
const userRouters = require('./routers/users')
const postRouters = require('./routers/posts')
const categoryRouters = require('./routers/categories')
const notificationRouters = require('./routers/notifications')
const locationRouters = require('./routers/locations')

// get helper 
const jwtAuthorization = require('./helpers/jwt')

const errorhandler = require('./helpers/errorHandler')

// dotenv configuration 
require('dotenv/config')

const api = process.env.API_URL;


//// The Middleware 
app.use(express.json({
    limit: '40mb'
}));
// app.use(express.urlencoded({
//     limit: '40mb'
// }));
app.use(morgan('tiny'))
app.use(jwtAuthorization())
app.use(errorhandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    //     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
////The Server/////
// listen to specific port 
// routers
app.use(`${api}/users`, userRouters);
app.use(`${api}/posts`, postRouters);
app.use(`${api}/categories`, categoryRouters);
app.use(`${api}/notifications`, notificationRouters);
app.use(`${api}/locations`, locationRouters);

mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'Amana',
        useCreateIndex: true
    }).then(() => {
        console.log("Database Connection is Ready")
    })
    .catch((err) => {
        console.log(err);
    })
// production 
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port
    console.log("Express is now working on port " + port)
})