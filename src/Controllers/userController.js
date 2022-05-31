const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')
const {uploadFile} =require('../aws/AWS')
const bcrypt = require('bcrypt');
const saltRounds = 10;

/*--------------Post/resgiste-api----------------*/
const userCreate = async function (req, res) {

    try {
        let data = req.body
        
        let { fname, lname, phone, email,  password,address} = data
  


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
        //check address are given or not
       if(!address){return res.status(400).send({status: false,message: "address is Required"})}
       else {
       let add = JSON.parse(address)
       //validation shipping
    if(!add.shipping) return  res.status(400).send({status: false,massage: "shipping is Required"});
    if(!Validator.isValid(add.shipping.street)) return  res.status(400).send({status: false,massage: "Shipping street is Required"});
    if(!Validator.isValidString(add.shipping.street))return res.status(400).send({ status: false, massage: "Shipping street   must be alphabetic characters" })
    if(!Validator.isValid(add.shipping.city)) return  res.status(400).send({status: false,message: "Shipping city is Required"});
    if(!Validator.isValidString(add.shipping.city))return res.status(400).send({ status: false, massage: "Shipping city   must be alphabetic characters" })
    if(!add.shipping.pincode) return  res.status(400).send({status: false,message: "shipping pincode is Required"});
    if(!/^[0-9]{6}$/.test(add.shipping.pincode)) return res.status(400).send({status: false,message: "Shipping Pincode  is not valid minlenght:-6"});
//validation of billing
    if(!add.billing) return  res.status(400).send({status: false,message: "billing is Required"});    
    if(!Validator.isValid(add.billing.street)) return  res.status(400).send({status: false,message: "Billing street is Required"});
    if(!Validator.isValidString(add.billing.street))return res.status(400).send({ status: false, massage: "Billing street   must be alphabetic characters" })
    if(!add.billing.city) return  res.status(400).send({status: false,message: "billing city is Required"});
    if(!Validator.isValidString(add.billing.city))return res.status(400).send({ status: false, massage: "Billing city   must be alphabetic characters" })
    if(!add.billing.pincode) return  res.status(400).send({status: false,message: "billig pincode is Required"});    
    if(!/^[0-9]{6}$/.test(add.billing.pincode)) return res.status(400).send({status: false,message: "Billing Pincode  is not valid minlenght:-6"});
    data.address = add
       }  
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
        let compare = await bcrypt.compare(password, hash.password).then((res) => {
            return res
          });
      
          if (!compare) {return res.status(400).send({ status: false, msg: "password not valid" });}
       

        //create the jwt token 
        let token = jwt.sign({
            userId: hash._id.toString(),
            group: 49

        }, "project5Group49", { expiresIn: "1d" });

        res.setHeader("x-api-key", token);

        return res.status(200).send({ status: true, message: "User login successfull", iat: new String(Date()),data:{ userId: hash._id.toString(), token }})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

/*-----------getUserById-api--------------*/


const getUserById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        const userData = await userModel.findOne({ _id: userId })
            .select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 })

        if (!userData) return res.status(404).send({ status: false, message: "User is not found " })
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
        let update= {}

        let { fname, lname, email, phone, password, address } = data
       
    
        if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data for updation" }) }
        if(fname)
        if (!Validator.isValidString(fname)) return res.status(400).send({ status: false, message: "First name  must be alphabetic characters" })
        update["fname"]= fname
        if(lname)
        if (!Validator.isValidString(lname)) return res.status(400).send({ status: false, message: "Invalid last name name : Should contain alphabetic characters only" });
         update["lname"]=lname
       if(email)
        if (!Validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: "Invalid email address" }) };
         const isEmailUsed = await userModel.findOne({ email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message: "email is already used, try different one" });
        update["email"]=email
        if(phone)
        if (!Validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number." });
        const isPhoneUsed = await userModel.findOne({ phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message: "phone is already used, try different one" });
        update["phone"]=phone
        if(password){ //check the password are given or not
        if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});      
        let encryptedPassword = bcrypt //convert to the password in bc
        .hash(password, saltRounds)
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          return hash;
        });
         update["password"]= await encryptedPassword;
         let files = req.files
         if (files && files.length > 0) {
             let uploadedFileURL = await uploadFile(files[0])
             update["profileImage"] = uploadedFileURL
         }
    } 
 
        if (address) {
            add = JSON.parse(address);
           
            const { shipping, billing } = add
            if(shipping){
                let {street,city,pincode} =shipping
            if(street){
                if(!Validator.isValidString(street))return res.status(400).send({ status: false, message: "Shipping street   must be alphabetic characters" })
            update["address.shipping.street"]=street}
            if(city){
                if(!Validator.isValidString(city))return res.status(400).send({ status: false, message: "Shipping city must be alphabetic characters" })  
                update["address.shipping.city"]=city
            }
            if(pincode){
                if(!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Shipping pincode must be number min length 6"})
                update["address.shipping.pincode"]=pincode
            }}
            if(billing){
                let {street,city,pincode} = billing
                if(street){
                    if(!Validator.isValidString(street))return res.status(400).send({ status: false, message: "Billing street   must be alphabetic characters" })
                update["address.billing.street"]=street
                }
                if(city){
                    if(!Validator.isValidString(city))return res.status(400).send({ status: false, message: "Billing city must be alphabetic characters" })  
                    update["address.billing.city"]=city
                }
                if(pincode){
                    if(!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Billing pincode must be number min length 6" })
                    update["address.billing.phone"]=pincode
                } 
            }
        }
        let updatedData = await userModel.findOneAndUpdate({ _id: user }, {$set:update}, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedData })

    }
    catch (err) {
        res.status(500).send({ err: err.message })
    }
}


module.exports = { userCreate, Login, getUserById, updatedUser }

