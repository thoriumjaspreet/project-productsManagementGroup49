const cartModel=require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')


const createCart= async function(req,res){
  try{
    let data=req.body
    const userIdByParams = req.params.userId
   let items=data.items
    let [{productId, quantity}] =items
   for(let i=0; i<items.length; i++)
console.log(items[i].productId)

    if (!Validator.isValidReqBody(data))
     { return res.status(400).send({ status: false, msg: "Please provide  data" }) }


     if(!Validator.isValid(productId)) return res.status(400).send({ status: false, msg: "product id is required" }) 
    
      if(!Validator.isValidObjectId(productId))  return res.status(400).send({ status: false, message: "Invalid productId" })
     
      let product= await productModel.findOne({_id:productId, isDeleted:false})
      if(!product) return res.status(400).send ({status:false,message:"product not found"})
      

     if(!quantity) return res.status(400).send({ status: false, msg: "quantity is required" }) 
     if(!/^[0-9]{1,6}$/.test(quantity)) 
     return res.status(400).send({status: false,message: "minimum quantity 1"});

  const user = await userModel.findOne({_id:userIdByParams})
    if(!user) {return res.status(400).send({ status: false, message: "No user is exist with this user id or user is deleted" })}

    let userCart= await cartModel.findOne({userId:userIdByParams})
    if(userCart) {
    
      let addItem=await cartModel.findOneAndUpdate({userId:userIdByParams},{$:update},{new:true})
      return res.status(201).send({status:true,message:"Item added successfully",data:addItem})



      
     }
  
  
  
    // if (userIdByParams = reqUserId) { return res.status(400).send({ status: false, msg: "Both userId should be same" }) }

    // let {items,totalPrice, totalItems} = data
    //
    }catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
}
  module.exports={
    createCart
  }