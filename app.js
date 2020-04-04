require('dotenv').config()

const express = require('express');
const utilRouter = require('./routers/utils');
const userRouter = require('./routers/user');

const cors = require('cors');

const port = process.env.PORT;
// const port = 3008;
require('./db/db');

const app = express();

app.use(express.json());

app.use(cors({
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar', 'Authorization'],
}));
app.use(utilRouter);
// app.use(userRouter);


// If a route is not found in all
app.use(function(req, res) {
    res.status(404);
    res.send({status: false, error: 'Route not found'});

});

app.listen(port, () => {
    console.log(`Server running on port  ${port}`)
});