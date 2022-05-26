
const productModel = require('../models/productModel')
const Validator = require('../Validator/valid')
const {uploadFile} = require('../aws/AWS')


const createProduct = async function(req,res){
    try{
        let data = req.body;
        let files = req.files;

      let {title,description,price,currencyId,currencyFormat,style,availableSizes,installments}=data
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