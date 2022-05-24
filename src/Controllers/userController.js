const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')



/**************************************** Login user ******************************************/

const Login =async function(req,res){
    try{
        let data =req.body
        const{ email, password} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user details"})}
       
        if(!Validator.isValid(email)){ return res.status(400).send({status: false,message: "Email is Required"});}
      
        if(!Validator.isValid(password)){return res.status(400).send({status: false,message: "Password is Required"});}
       
        let logCheck = await userModel.findOne({email:email,password:password});
        if(!logCheck){
            return res.status(400).send({ status: false, message: "This email id and password not valid"});
        }
       
        //create the jwt token 
        let token = jwt.sign({
            userId:logCheck._id.toString(),
            group:49

        },"project5Group49",{expiresIn: "1200s" });
        res.setHeader("x-api-key", token);
       
       return res.status(200).send({ status: true, message: "Login Successful",iat:new String(Date()), userId:logCheck._id.toString(),token: token})
    }
    catch(err){
        return res.status(500).send({status : false , message: err.message});
    }
}







const getUserById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        const userData = await userModel
            .findOne({ _id: userId })
            .select({ address:1, _id:1, fname:1,lname:1, email:1, profileImage:1, phone:1, password:1  })

        if (!userData) return res.status(404).send({ status: false, message: "User is not found or book is deleted" })
        return res.status(200).send({ status: true,message:"user profile details", data: userData })
    }catch(err){
        res.status(500).send({ status: false, message: err.message })

    }
}

module.exports ={Login,getUserById}

