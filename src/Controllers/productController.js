const jwt = require('jsonwebtoken')
const productModel = require('../models/productModel')
const Validator = require('../Validator/valid')
const aws = require("aws-sdk")
var validator = require("email-validator");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
      // this function will upload file to aws and return the link
      let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

      var uploadParams = {
          ACL: "public-read",
          Bucket: "classroom-training-bucket",  //HERE
          Key: "abc/" + file.originalname, //HERE 
          Body: file.buffer
      }

      s3.upload(uploadParams, function (err, data) {
        if (err) {
            return reject({ "error": err })
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

})
}



const createProduct = async function(req,res){
    try{
        let data = req.body;
        let files = req.files;
      // data = JSON.parse(JSON.stringify(data))


      let {title,description,price,currencyId,currencyFormat,productImage,style,availableSizes,installments}=data
      if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data" }) }

      if (!Validator.isValid(title)) return res.status(400).send({ status: false, message: "title is Required" });
      if (!Validator.isValidString(title)) return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })
      
      if (!Validator.isValid(description)) return res.status(400).send({ status: false, message: "description is Required" });
      if (!Validator.isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })
      
      if (!(price)) return res.status(400).send({ status: false, message: "price is Required" });
        if (!!/^[0-9.]{100}$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })
        

        if(!(currencyId)) return res.status(400).send({ status: false, message: "currrencyId is Required" });
        if(( ["INR"].indexOf(currencyId) == -1) ) return res.status(400).send({status:false,message:"currency Id must be INR"})

        if(!(currencyFormat)) return res.status(400).send({ status: false, message: "currrency formet is Required" });
        if(( ["₹"].indexOf(currencyFormat) == -1) ) return res.status(400).send({status:false,message:"currency formet must be ₹ "})

      if(!Validator.isValidString(style))return res.status(400).send({ status: false, message: "style must be alphabetic characters" })

        if (!Validator.isValidavailableSizes(availableSizes)) return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })


        
      
      console.log(data)
      //  data.availableSizes = JSON.parse(JSON.stringify(data.availableSizes))




        if (files && files.length > 0) {
            let fileUrl = await uploadFile(files[0]);
            data.productImage = fileUrl;
          } else {
            return res.status(400).send({ msg: "Product image is required" });
          }
        

        let savedData = await productModel.create(data)
        return res.status(201).send({status : true, message: "product created successfully" , data : savedData})

    }
    catch(err){
        return res.status(500).send({status : false , error : err.message})
    }
}




module.exports={createProduct}