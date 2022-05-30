const cartModel=require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')
const mongoose = require('mongoose');

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

const createCart = async function (req, res) {
  try {

      let requestBody = req.body
      let cartId = req.body.cartId
      let userId = req.params.userId
      
      
      if (!isValidRequestBody(requestBody)) {
          return res.status(400).send({ status: false, message: 'please provide cart details.' })
      }

      
      if (!isValidObjectId(userId)) {
          return res.status(400).send({ status: false, message: "Invalid userId " })
      }
  

      let isUserExists = await userModel.findOne({ _id: userId })
     
     
      if (!isUserExists) {
          return res.status(400).send({ status: false, message: "UserId does not exits" })
      }
      
      
      let cart = await cartModel.findOne({ userId: userId })

      
      const {productId, quantity } = requestBody

      if (!isValidObjectId(productId)) {
          return res.status(400).send({ status: false, message: "Invalid productId " })
      }
      let product = await productModel.findOne({ _id: productId, isDeleted: false })
      if (!product) {
          return res.status(400).send({ status: false, message: `No product found ${productId}` })
      }


      if (!(!isNaN(Number(quantity)))) {
          return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
      }
      if (quantity <= 0 || !isValidInteger(quantity)) {
          return res.status(400).send({ status: false, message: `Quantity must be an integer !! ` })
      }


      let isCartExists = await cartModel.findOne({ userId: userId })

      if (isCartExists) {

         
          let price = isCartExists.totalPrice + (product.price * quantity)

      
          let array = isCartExists.items
          
          for (i in array) {
              if (array[i].productId.toString() === productId) {
                  array[i].quantity = array[i].quantity + quantity

                 
                  const newCart = {
                      items: array,
                      totalPrice: price,
                      totalItems: array.length
                  }
                

                  let data = await cartModel.findOneAndUpdate({ _id: isCartExists._id }, newCart, { new: true })
                  return res.status(201).send({ status: true,msg:"cart created", data: data })
              }
         
          }

          array.push({ productId: productId, quantity: quantity })
          const newCart = {
              items: array,
              totalPrice: price,
              totalItems: array.length
          }

          let data = await cartModel.findOneAndUpdate({ _id: isCartExists._id }, newCart, { new: true })
          return res.status(201).send({ status: true,msg:"cart created", data: data })

      }
     

      let price = product.price * quantity
      let itemArr = [{ productId: productId, quantity: quantity }]

      const newCart = {
          userId: userId,
          items: itemArr,
          totalPrice:price,
          totalItems: 1
      }

      let data = await cartModel.create(newCart)
      res.status(201).send({ status: true,msg:"cart created", data: data })


  }
  catch (error) {
      console.log(error)
      res.status(500).send({ status: false, data: error.message });
  }

}



module.exports={
  createCart
}