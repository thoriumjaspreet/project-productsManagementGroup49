const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')
const aws= require("aws-sdk")



aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
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


const userCreate = async function (req, res){

    try {
        let data = req.body

        let {fname,lname, phone, email, password,profileImage,} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user data"})}
       
        if(!Validator.isValid(fname)) return res.status(400).send({status: false,message: "First name is Required"});
        if (!Validator.isValidString(fname)) return res.status(400).send({ status: false, message: "First name  must be alphabetic characters" })
        
        if(!Validator.isValid(lname)) return res.status(400).send({status: false,message: " Last Name is Required"});
        if(!Validator.isValidString(lname)) return res.status(400).send({status: false, message: "Invalid last name name : Should contain alphabetic characters only"});
       
        if(!Validator.isValid(email)) return res.status(400).send({status: false,message: "Email is Required"});
        if (!Validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email address"});

        //check unique email
        const isEmailUsed = await userModel.findOne({email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message:  "email is already used, try different one"});

        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] ) 
            data.profileImage = uploadedFileURL
        }
        else{
           return res.status(400).send({ msg: "Profile image is required" })}
        
      
        if (!phone) return res.status(400).send({status: false,message: "Phone is Required"});
        if (!Validator.isValidPhone(phone))  return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number."});

        //check unique phone
        const isPhoneUsed = await userModel.findOne({phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message:"phone is already used, try different one"});

        if(!Validator.isValid(password)) return res.status(400).send({status: false,message: "Password is Required"});
        if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});

        if(!/^[0-9]{6}$/.test(data.address.pincode)) return res.status(400).send({status: false,message: "Pincode  is not valid minlenght:-6"});

      

        //Newly created book can only have 0 reviews
        if(data.reviews&&data.reviews!=0) return res.status(400).send({status : false , message : "Newly created book can only have 0 reviews"})

        //Newly created book can only have isDeleted : false
        if(data.isDeleted&&data.isDeleted!=false) return res.status(400).send({status : false , message : "Newly created book can only have isDeleted : false"})

        let saveData = await userModel.create(data)
        return res.status(201).send({status:true,msg:"User createted successfully",data:saveData})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



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

module.exports ={userCreate,Login,getUserById}

