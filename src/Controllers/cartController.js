const cartModel=require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')




const createCart = async function(req, res) {
  try{
  let userId = req.params.userId;
  let data = req.body
  let items2 

  if (!Validator.isValidReqBody(data)) { return res.status(400).send({status: false, message: "Plaese Provide all required field" })
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
      let createItem = createCart.items
    let itemData = createItem.map(({productId, quantity}) => {
     return {productId, quantity};
    })
      return res.status(201).send({status:true,msg:"success",data:{_id:createItem._id,userId:createItem.userId,items:itemData,totalPrice:createItem.totalPrice,totalItems:createItem.totalItems}})
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
    let update = updateCart.items

let itemData = update.map(({productId, quantity}) => {
  return {productId, quantity};
})
    return res.status(200).send({_id:updateCart._id,userId:updateCart.userId,items:itemData,totalPrice:updateCart.totalPrice,totalItems:updateCart.totalItems})
 }catch (error) {
  return res.status(500).send({ status: false, ERROR: error.message })
}
}
module.exports={
  createCart
}