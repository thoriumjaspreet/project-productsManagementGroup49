const cartModel = require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')




const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body
    let items2

    let User = await userModel.findById(userId)
    if (!User) return res.status(404).send({ status: false, msg: "User not exist" })

    if (!Validator.isValidReqBody(data)) {
      return res.status(400).send({ status: false, message: "Plaese Provide all required field" })
    }

    let items = data.items
    if (!items) return res.status(400).send({ status: false, msg: "items is required" })
    if (typeof (items) == "string") {
      items = JSON.parse(items)
    }
    if (toString.call(items) !== "[object Array]")
      return res.status(400).send({ status: false, msg: "items should be array objects" })

  
    let [{ productId, quantity }] = items


    if (!Validator.isValid(productId)) return res.status(400).send({ status: false, msg: "product id is required" })

    if (!Validator.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" })

    if (!quantity) return res.status(400).send({ status: false, msg: "quantity is required" })

    if (!(!isNaN(Number(quantity)))) {
      return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
    }
    if (quantity <= 0) {
      return res.status(400).send({ status: false, message: `Quantity must be an integer min 1!! ` })
    }

    const isCartExist = await cartModel.findOne({userId: userId })

    let totalPrice = 0;
    if (!isCartExist) {
      for (let i = 0; i < items.length; i++) {
        let productId = items[i].productId
        let quantity = items[i].quantity

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct) {
          return res.status(404).send({ status: false, message: "product is not valid " })
        }
        totalPrice = totalPrice + (findProduct.price * quantity)
      }
      let cart = {
        userId: userId,
        items: [{
          productId: productId,
          quantity: quantity
        }],
        totalPrice: totalPrice,
        totalItems: items.length
      }
      let createCart = await cartModel.create(cart)
      let createItem = createCart.items
      let itemData = createItem.map(({ productId, quantity }) => {
        return { productId, quantity };
      })
      return res.status(201).send({
        status: true, msg: "Create cart successfull", data: {
          _id: createCart._id, userId: createCart.userId, items: itemData, totalPrice: createCart.totalPrice, totalItems: createCart.totalItems,
          createdAt: createCart.createdAt, updatedAt: createCart.updatedAt
        }
      })
    }
    if (isCartExist) {
      items2 = isCartExist.items
    }
    let findProduct = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
    if (!findProduct) {
      return res.status(400).send({ status: false, message: "product is not valid" })
    }
    // res.send(findProduct)
    let totalPrice2 = findProduct.price
    let newquantity = items[0].quantity
    let flag = 0

    for (let i = 0; i < items2.length; i++) {
      let productId = items2[i].productId
      if (productId == items[0].productId) {
        flag = 1
        items2[i].quantity = items2[i].quantity + newquantity
      }

    } totalPrice2 = Math.round(totalPrice2 * newquantity + isCartExist.totalPrice)
    if (flag == 0) {
      items2.push(items[0])
    }
    let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: items2, totalPrice: totalPrice2, totalItems: items2.length } }, { new: true })
    let update = updateCart.items

    let itemData = update.map(({ productId, quantity }) => {
      return { productId, quantity };
    })
    return res.status(200).send({
      status: true, msg: "update cart successfully"
      , data: { _id: updateCart._id, userId: updateCart.userId, items: itemData, totalPrice: updateCart.totalPrice, totalItems: updateCart.totalItems, createdAt: updateCart.createdAt, updatedAt: updateCart.updatedAt }
    })
  } catch (error) {
    return res.status(500).send({ status: false, ERROR: error.message })
  }
}



//========================================================get cart=========================================================*

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId


    let User = await userModel.findById(userId)

    if (!User) { return res.status(404).send({ status: false, msg: 'user not found' }) }

    let checkUser = await cartModel.findOne({ userId: userId })

    if (!checkUser) {
      return res.status(400).send({ status: false, msg: 'cart not found' })
    }
    let update = checkUser.items

    let itemData = update.map(({ productId, quantity }) => {
      return { productId, quantity };
    })
    res.status(200).send({ status: true, msg: "success", data: { _id: checkUser._id, userId: checkUser.userId, items: itemData, totalPrice: checkUser.totalPrice, totalItems: checkUser.totalItems, createdAt: checkUser.createdAt, updatedAt: checkUser.updatedAt } })
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
}
//=======================================================delete cart=========================================================

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId

    //check if the document is found with that user id 

    let checkUser = await userModel.findById(userId)
    if (!checkUser) { return res.status(400).send({ status: false, msg: "user not found" }) }

    let Cart = await cartModel.findOne({ userId: userId })
    if (!Cart) {
      return res.status(404).send({ status: false, msg: "cart not exists" })
    }
    const items = []
    let cartDeleted = await cartModel.findOneAndUpdate({ userId: userId },
      { $set: { items: items, totalItems: 0, totalPrice: 0 } }, { new: true })


    return res.status(200).send({ status: true, data: cartDeleted })
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })

  }
}



//===================================Update cart ===================================================//

const updateCart = async function (req, res) {
  try {
    let userId = req.params.userId
    let requestBody = req.body


    if (!Validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid userId in body" })
    }



    let user = await userModel.findOne({ _id: userId })
    if (!user) {
      return res.status(400).send({ status: false, message: "UserId does not exits" })
    }

    const { cartId, productId, removeProduct } = requestBody

    if (!Validator.isValidReqBody(requestBody)) {
      return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
    }
    //cart

    if (!Validator.isValid(cartId)) return res.status(400).send({ status: false, msg: "cart id is required" })


    if (!Validator.isValidObjectId(cartId)) {
      return res.status(400).send({ status: false, message: "Invalid cartId in body" })
    }

    let cart = await cartModel.findById(cartId)


    if (!cart) {
      return res.status(400).send({ status: false, message: "cartId does not exits" })
    }
    //product
    if (!Validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "Invalid productId in body" })
    }

    let product = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!product) {
      return res.status(400).send({ status: false, message: "productId does not exits" })
    }
    //find if products exits in cart
    let isProductinCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

    if (!isProductinCart) {
      return res.status(400).send({ status: false, message: `This ${productId} product does not exits in the cart` })
    }

    //removeProduct validation
    if (!(!isNaN(Number(removeProduct)))) {
      return res.status(400).send({ status: false, message: `removeProduct should be a valid number either 0 or 1` })
    }
    if (!((removeProduct === 0) || (removeProduct === 1))) {
      return res.status(400).send({ status: false, message: 'removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) ' })
    }


    let findQuantity = cart.items.find(x => x.productId.toString() === productId)

    if (removeProduct === 0) {

      let totalAmount = cart.totalPrice - (product.price * findQuantity.quantity) // substract the amount of product*quantity

      await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })   //pull the product from itmes  //https://stackoverflow.com/questions/15641492/mongodb-remove-object-from-array

      let quantity = cart.totalItems - 1
      let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

      return res.status(200).send({ status: true, message: `${productId} is been removed`, data: data })

    }
    if (removeProduct === 1) {


      // decrement quantity
      let totalAmount = cart.totalPrice - product.price
      let arr = cart.items
      for (i in arr) {
        if (arr[i].productId.toString() == productId) {
          arr[i].quantity = arr[i].quantity - 1
          if (arr[i].quantity < 1) {
            await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
            let quantity = cart.totalItems - 1
            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

            return res.status(400).send({ status: false, message: 'no such Quantity/Product present in this cart', data: data })
          }
        }
      }

      let data = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount }, { new: true })

      return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: data })
    }
  }
  catch (error) {
    console.log(error)
    res.status(500).send({ status: false, data: error.message });
  }
}



module.exports = {
  createCart, getCart, deleteCart, updateCart
}