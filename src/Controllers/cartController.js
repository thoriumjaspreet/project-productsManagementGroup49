const cartModel=require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')


// const createCart= async function(req,res){
//   try{
//     let data=req.body
//     const userIdByParams = req.params.userId
//    let items=data.items
//     let [{productId, quantity}] =items
//    for(let i=0; i<items.length; i++){
//   //  let productId = items[i].productId
//   //  let quantity = items[i].quantity
//     let findProduct = await productModel.findOne({_id:productId,isDeleted:false});
// console.log(items[i].productId)

//    }

//     if (!Validator.isValidReqBody(data))
//      { return res.status(400).send({ status: false, msg: "Please provide  data" }) }


//      if(!Validator.isValid(productId)) return res.status(400).send({ status: false, msg: "product id is required" }) 
    
//       if(!Validator.isValidObjectId(productId))  return res.status(400).send({ status: false, message: "Invalid productId" })
     
//       let product= await productModel.findOne({_id:productId, isDeleted:false})
//       if(!product) return res.status(400).send ({status:false,message:"product not found"})
      

//      if(!quantity) return res.status(400).send({ status: false, msg: "quantity is required" }) 
//      if(!/^[0-9]{1,6}$/.test(quantity)) 
//      return res.status(400).send({status: false,message: "minimum quantity 1"});

//   const user = await userModel.findOne({_id:userIdByParams})
//     if(!user) {return res.status(400).send({ status: false, message: "No user is exist with this user id or user is deleted" })}

//     let userCart= await cartModel.findOne({userId:userIdByParams})
//     if(userCart) {
    
//       let addItem=await cartModel.findOneAndUpdate({userId:userIdByParams},{$:update},{new:true})
//       return res.status(201).send({status:true,message:"Item added successfully",data:addItem})



      
//      }
  
  
  
//     // if (userIdByParams = reqUserId) { return res.status(400).send({ status: false, msg: "Both userId should be same" }) }

//     // let {items,totalPrice, totalItems} = data
//     //
//     }catch (err) {
//     return res.status(500).send({ status: false, error: err.message });
//   }
// }
//   module.exports={
//     createCart
//   }

const isValid = function (value) {
  if (typeof value == 'undefined' || value == 'null' || value.length == 0) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true
}

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}
const isValidObjectId = function(objectId){
  return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidInteger = function isInteger(value) {
  return value % 1 == 0;
}
const isValidString = function (value) {
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

const createCart = async function(req, res) {
  try{
  let userId = req.params.userId;
  let data = req.body
  let items2 
  if(!(isValid(userId))&&(isValidObjectId(userId))){
      return res.status(400).send({status:false, message:"Please provide a valid userId"})
  }
  if (!isValidRequestBody(data)) {
    return res.status(400).send({status: false, message: "Plaese Provide all required field" })
}
   let items = data.items
   if (typeof(items) == "string"){
      items = JSON.parse(items)
  }
   const isCartExist = await cartModel.findOne({userId:userId})
   let totalPrice = 0;
   if(!isCartExist){
      for(let i = 0; i < items.length; i++){
        let productId = items[i].productId
        let quantity = items[i].quantity
         let findProduct = await productModel.findOne({_id:productId,isDeleted:false});
         if(!findProduct){
          return res.status(400).send({status:false, message:"product is not valid or product is deleted"})
         }
         totalPrice = totalPrice + (findProduct.price*quantity)
       }
      let createCart = await cartModel.create({userId:userId,items:items,totalPrice:totalPrice,totalItems:items.length })
      
      return res.status(201).send({status:true,msg:"success",data:createCart})
   } if(isCartExist){
        items2 = isCartExist.items
   }
      let findProduct = await productModel.findOne({_id:items[0].productId,isDeleted:false})
      if(!findProduct){
        return res.status(400).send({status:false, message:"product is not valid"})
       }
     // res.send(findProduct)
      let totalPrice2 = findProduct.price
      let newquantity = items[0].quantity
      let flag = 0
      
         for(let i = 0; i < items2.length; i++){
             let productId = items2[i].productId
          if(productId == items[0].productId){
                 flag = 1
                 items2[i].quantity = items2[i].quantity + newquantity}
             
 }    totalPrice2 = Math.round(totalPrice2 * newquantity + isCartExist.totalPrice) 
      if(flag == 0){
          items2.push(items[0])
      }
     let updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:items2,totalPrice:totalPrice2,totalItems:items2.length}},{new:true})
             return res.status(200).send(updateCart)
 }catch (error) {
  return res.status(500).send({ status: false, ERROR: error.message })
}
}
module.exports={
  createCart
}