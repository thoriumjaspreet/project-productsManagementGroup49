const mongoose = require("mongoose")
const moment = require("moment")
const ObjectId = mongoose.Schema.Types.ObjectId

const userModel = new mongoose.Schema(
    {

    
        fname: {type:string, required:true},
        lname: {type:string, required:true},
        email: {type:string, required:true,  unique:true},
        profileImage: {type:string, required:true}, // s3 link
        phone: { type: Number, required: true, unique: true }, 
        password: { type: String, required: true, minlength: 8, maxlength: 15}, // encrypted password
        address: {
          shipping: {
            street: {type:string, required:true},
            city: {type:string, required:true},
            pincode: {type:Number, required:true}
          },
          billing: {
            street: {type:string, required:true},
            city: {type:string, required:true},
            pincode: {type:Number, required:true}
          }
        }
    },
        { timestamps: true })

        module.exports=mongoose.model('User',userModel)