const jwt = require('jsonwebtoken')
const productModel = require('../models/productModel')
const Validator = require('../Validator/valid')
const aws = require("aws-sdk")
var validator = require("email-validator");



const createProduct = async function(req,res){
    try{
        let data = req.body;
        let files = req.files;
      // data = JSON.parse(JSON.stringify(data))
        console.log(data)
      //  data.availableSizes = JSON.parse(JSON.stringify(data.availableSizes))

        if (files && files.length > 0) {
            let fileUrl = await uploadFile(files[0]);
            data.productImage = fileUrl;
          } else {
            return res.status(400).send({ msg: "No file found" });
          }
        

        let savedData = await productModel.create(data)
        return res.status(201).send({status : true, message: "product created successfully" , data : savedData})

    }
    catch(err){
        return res.status(500).send({status : false , error : err.message})
    }
}