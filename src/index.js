const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const { default: mongoose } = require('mongoose');
const app = express();

const multer= require("multer");
const { AppConfig } = require('aws-sdk')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( multer().any())
mongoose.connect("mongodb+srv://shama_khan:x5nLRtcnPDiTtBGB@cluster0.hb5lr.mongodb.net/group49Database", {useNewUrlParser: true})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});