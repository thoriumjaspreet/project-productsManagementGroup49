const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const { default: mongoose } = require('mongoose');
const app = express();

const multer= require("multer");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( multer().any())
mongoose.connect("mongodb+srv://shama_khan:x5nLRtcnPDiTtBGB@cluster0.hb5lr.mongodb.net/group49Database", {useNewUrlParser: true})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route);

app.all('*', function(req, res) {
    throw new Error("Bad request")
})

app.use(function(e, req, res, next) {
    if (e.message === "Bad request") {
        res.status(400).send({status : false , error: e.message});
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});