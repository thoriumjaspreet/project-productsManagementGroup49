const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')
const {uploadFile} =require('../aws/AWS')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userCreate = async function (req, res) {

    try {
        let data = req.body
        
        let { fname, lname, phone, email,  password } = data
  


        /*----------------------------validations ----------------------------*/
        if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data" }) }

        if (!Validator.isValid(fname)) return res.status(400).send({ status: false, message: "First name is Required" });
        if (!Validator.isValidString(fname)) return res.status(400).send({ status: false, message: "First name  must be alphabetic characters" })

        if (!Validator.isValid(lname)) return res.status(400).send({ status: false, message: " Last Name is Required" });
        if (!Validator.isValidString(lname)) return res.status(400).send({ status: false, message: "Invalid last name name : Should contain alphabetic characters only" });

      if(!Validator.isValid(email)) return res.status(400).send({status: false,message: "Email is Required"});
        if (!Validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email address" });

        //check unique email
        const isEmailUsed = await userModel.findOne({ email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message: "email is already used, try different one" });

        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            data.profileImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ msg: "Profile image is required" })
        }


        if (!phone) return res.status(400).send({ status: false, message: "Phone is Required" });
        if (!Validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number." });

        //check unique phone
        const isPhoneUsed = await userModel.findOne({ phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message: "phone is already used, try different one" });
         


        if (!Validator.isValid(password)) return res.status(400).send({ status: false, message: "Password is Required" });
        if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456" });
       
        let encryptedPassword = bcrypt
        .hash(data.password, saltRounds)
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          return hash;
        });
        data.password = await encryptedPassword;
        let address=JSON.parse(req.body.address)
        data.address=address
          

       if(!address)return  res.status(400).send({status: false,message: "address is Required"});
    if(!address.shipping) return  res.status(400).send({status: false,message: "shipping is Required"});
    if(!address.shipping.street) return  res.status(400).send({status: false,message: "street is Required"});
    if(!address.shipping.city) return  res.status(400).send({status: false,message: "city is Required"});
    if(!address.shipping.pincode) return  res.status(400).send({status: false,message: "pincode is Required"});
    if(!/^[0-9]{6}$/.test(address.shipping.pincode)) return res.status(400).send({status: false,message: "Pincode  is not valid minlenght:-6"});

    if(!address.billing) return  res.status(400).send({status: false,message: "billing is Required"});    
    if(!address.billing.street) return  res.status(400).send({status: false,message: "street is Required"});
    if(!address.billing.city) return  res.status(400).send({status: false,message: "city is Required"});
    if(!address.billing.pincode) return  res.status(400).send({status: false,message: "pincode is Required"});    
    if(!/^[0-9]{6}$/.test(address.billing.pincode)) return res.status(400).send({status: false,message: "Pincode  is not valid minlenght:-6"});
        
        let saveData = await userModel.create(data)
        return res.status(201).send({status:true,msg:"User createted successfully",data:saveData})
    
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

/**************************************** Login user ******************************************/

const Login = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data

        /*----------------------------validations ----------------------------*/
        if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user details" }) }

        if (!Validator.isValid(email)) { return res.status(400).send({ status: false, message: "Email is Required" }); }

        if (!Validator.isValid(password)) { return res.status(400).send({ status: false, message: "Password is Required" }); }

        let hash = await userModel.findOne({email:email});
        if(!hash){
            return res.status(400).send({ status: false, message: "This email id not valid"});
        }
        let compare = bcrypt.compare(password, hash.password).then((res) => {
            return res
          });
      
          if (!compare) {return res.status(400).send({ status: false, msg: "credantials not valid" });}
       

        //create the jwt token 
        let token = jwt.sign({
            userId: hash._id.toString(),
            group: 49

        }, "project5Group49", { expiresIn: "1200s" });
        //res.setheader("x-api-key", token);

        return res.status(200).send({ status: true, message: "User login successfull", iat: new String(Date()),data:{ userId: hash._id.toString(), token }})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}




const getUserById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        const userData = await userModel
            .findOne({ _id: userId })
            .select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 })

        if (!userData) return res.status(404).send({ status: false, message: "User is not found or book is deleted" })
        return res.status(200).send({ status: true, message: "user profile details", data: userData })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}





//---Put-api------------------------*/
const updatedUser = async function (req, res) {
    try {
        let user = req.params.userId
        let data = req.body
        let { fname, lname, email, phone, password, address } = data


        
        if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data for updation" }) }
        if(fname)
        if (!Validator.isValidString(fname)) return res.status(400).send({ status: false, message: "First name  must be alphabetic characters" })
        if(lname)
        if (!Validator.isValidString(lname)) return res.status(400).send({ status: false, message: "Invalid last name name : Should contain alphabetic characters only" });
       if(email)
        if (!Validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: "Invalid email address" }) };
         const isEmailUsed = await userModel.findOne({ email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message: "email is already used, try different one" });
        if(phone)
        if (!Validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number." });
        const isPhoneUsed = await userModel.findOne({ phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message: "phone is already used, try different one" });

        // if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});


        let encryptedPassword = bcrypt
        .hash(data.password, saltRounds)
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          return hash;
        });
       let pwd = await encryptedPassword;
       

        let fieldToUpdate = {
            fname: req.body.fname,
            lname: req.body.lname,
            phone: req.body.phone,
            email: req.body.email,
            password: pwd
        };
        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            fieldToUpdate.profileImage = uploadedFileURL
        }
        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }

        if (address) {
            let add = JSON.parse(req.body.address);
            let obj = {
                billing: add.billing,
                shipping: add.shipping,
            };

            for (const [key, value] of Object.entries(obj)) {
                if (!value) delete obj[key];
            }
            let obj1={
                street: add.billing.street,
                city: add.billing.city,
                pincode: add.billing.pincode,
                street: add.shipping.street,
                city: add.shipping.city,
                pincode: add.shipping.pincode};
                for (const [key, value] of Object.entries(obj1)) {
                    if (!value) delete obj1[key];
                }
                obj.shipping ={...obj1}
                obj.billing={...obj1} 
                fieldToUpdate.address = { ...obj };
        }
        let updatedData = await userModel.findOneAndUpdate({ _id: user }, { $set: { ...fieldToUpdate } }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedData })

    }
    catch (err) {
        res.status(500).send({ err: err.message })
    }
}


module.exports = { userCreate, Login, getUserById, updatedUser }

