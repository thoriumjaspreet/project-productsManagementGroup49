const cartModel = require('../Models/cartModel')
const orderModel =require('../Models/orderModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')


//----------order-Create------------api/     
 const orderCreate = async function (req, res) {
    try {
        let user_id = req.params.userId
        let data = req.body

        let user =await userModel.findById(user_id)
        if(!user) return res.status(404).send({status:false,msg:"User not found"})
       
        if(!Validator.isValidReqBody(data)) return res.status(400).send({status:false,msg:"please enter order data"})    
        const {items,status,cancellable,isDeleted} =data
        if (toString.call(items) !== "[object Array]"){
            return res.status(400).send({status:false,msg:"items should be array objects"})
        }

        const [{productId,quantity}]= items

  if (!Validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId in body" })
        }
  

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: "productId does not exits" })
        }
      
        if(!quantity) return res.status(400).send({ status: false, msg: "quantity is required" })

    if (!(!isNaN(Number(quantity)))) {
    return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
    }
    if (quantity <= 0) {
    return res.status(400).send({ status: false, message: `Quantity must be an integer !! ` })
    }
        // let Cart = await cartModel.findById(cartId)
        // if(!Cart) return res.status(404).send({status:false,msg:"card not found"})

        let cartData = await cartModel.findOne({ userId: user_id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (!cartData) {
            return res.status(400).send({ status: false, message: "NO cart exist for this user" })
        }
        // console.log(cartData.items.length)
        if (cartData.items.length === 0) {
            return res.status(400).send({ status: false, message: "Your cart is empty,so can't order it" })

        }

        let cartDetails = JSON.parse(JSON.stringify(cartData))
        //console.log(cartData)
        // let cartDetails = req.body

        let itemsArr = cartDetails.items
        let totalQuantity = 0
        for (let i = 0; i < itemsArr.length; i++) {
            totalQuantity += itemsArr[i].quantity
        }
        cartDetails.totalQuantity = totalQuantity
        if (data.status) {
            if (data.status != "pending" && data.status != "completed" && data.status != "cancled") {
                return res.status(400).send({ status: false, message: "status should be-'pending','completed','cancled'" })
            }
        }
        let orderDetails = await orderModel.create(cartDetails)
        await cartModel.findOneAndUpdate({ userId: user_id }, { items: [], totalPrice: 0, totalItems: 0 })
        return res.status(201).send({ status: true, message: "order created successfully", data: orderDetails })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { orderCreate }