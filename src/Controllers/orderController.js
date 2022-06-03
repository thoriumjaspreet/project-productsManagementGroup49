const cartModel = require('../Models/cartModel')
const orderModel = require('../Models/orderModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')


//----------order-Create------------api/     
const orderCreate = async function (req, res) {
    try {
        let user_id = req.params.userId
        let data = req.body

        let user = await userModel.findById(user_id)
        if (!user) return res.status(404).send({ status: false, msg: "User not found" })

        if (!Validator.isValidReqBody(data)) return res.status(400).send({ status: false, msg: "please enter order data" })
        const { items, status, cancellable, isDeleted } = data
        if (toString.call(items) !== "[object Array]")
            return res.status(400).send({ status: false, msg: "items should be array objects" })


        const [{ productId, quantity }] = items
        let item = 0
        for (let i = 0; i < items.length; i++) {
            item = item + items[i].quantity

        }
        console.log(item)



        if (!Validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId in body" })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: "productId does not exits" })
        }

        if (!quantity) return res.status(400).send({ status: false, msg: "quantity is required" })

        if (!(!isNaN(Number(quantity))))
            return res.status(400).send({ status: false, message: `Quantity should be a valid number` })

        if (quantity <= 0)
            return res.status(400).send({ status: false, message: `Quantity must be an integer !! ` })
        if (status) {
            if (!Validator.isValidStatus(status))
                return res.status(400).send({ status: false, message: "status should be-'pending','completed','cancled'" })
        }

        if (cancellable) {
            if (!((cancellable === 'true') || (cancellable === 'false'))) return res.status(400).send({ status: false, massage: 'cancellable should be a boolean value' })
        }
        if (isDeleted) {
            if (data.isDeleted && data.isDeleted != false) return res.status(400).send({ status: false, message: "Newly created oder can only have isDeleted : false" })
        }


        let cartData = await cartModel.findOne({ userId: user_id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (!cartData) {
            return res.status(400).send({ status: false, message: "NO cart exist for this user" })
        }
        // console.log(cartData.items.length)
        if (cartData.items.length === 0) {
            return res.status(400).send({ status: false, message: "Your cart is empty,so can't order it" })

        }


        let itemsArr = cartData.items
        let totalQuantity = 0
        for (let i = 0; i < itemsArr.length; i++) {
            totalQuantity += itemsArr[i].quantity - quantity
        }

        let order = {
            userId: cartData.userId,
            items: [{
                productId: productId,
                quantity: quantity
            }],
            status: status,
            cancellable: cancellable,
            totalQuantity: item,
            totalPrice: product.price * item,
            totalItems: items.length
        }

        if (cartData.totalItems <= 1) {
            order.totalItems = cartData.totalItems
        } else {
            order.totalItems = cartData.totalItems - items.length
        }
        /**************************** crete order ************************/
        let orderDetails = await orderModel.create(order)

        let updateCard = {}
        console.log(totalQuantity)

        if (totalQuantity <= 1) {
            updateCard["items"] = []
            updateCard["totalPrice"] = 0
            updateCard["totalItems"] = 0
        } else {
            let updateItems = [{
                productId: productId,
                quantity: totalQuantity
            }]
            if (cartData.totalItems <= 1) {
                updateCard["totalItems"] = cartData.totalItems
            } else {
                updateCard["totalItems"] = cartData.totalItems - items.length
            }
            updateCard["items"] = updateItems;
            updateCard["totalPrice"] = cartData.totalPrice - product.price * quantity;
        }

        console.log(updateCard)

        await cartModel.findOneAndUpdate({ userId: user_id }, { $set: updateCard }, { new: true })

        // let itemData = createItem.map(({ productId, quantity }) => {
        //     return { productId, quantity };
        //   })
        return res.status(201).send({ status: true, message: "order created successfully", data: orderDetails })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const updateOrder = async function (req, res) {
    try {
        let requestBody = req.body
        let userId = req.params.userId
        const { status, orderId } = requestBody


        let userExist = await userModel.findOne({ _id: userId })
        if (!userExist) {
            return res.status(404).send({ status: false, message: "user not found" })
        }


        if (!Validator.isValidReqBody(requestBody)) {
            return res.status(400).send({ status: false, message: "fill required value in body" })
        }


        if (!Validator.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "provide orderId in request body" })
        }
        if (!Validator.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "provide Valid cartId in request body" })
        }


        let orderPresent = await orderModel.findOne({ _id: orderId, isDeleted: false })

        if (!orderPresent) {
            return res.status(404).send({ status: false, message: "Order not found " })
        }
        let orderUser = orderPresent.userId.toString()
        if(orderUser != userId){
            return res.status(400).send({status:false,msg:"This order id is not belongs to the user"})
        }
 
            if (!Validator.isValidStatus(status))
                return res.status(400).send({ status: false, message: "status should be-'pending','completed','cancled'" })
        

        if (status == "pending" || status == "completed") {
            return res.status(400).send({ status: false, message: "status can not be pending and completed" })
        }
       
    

        let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: requestBody }, { new: true })
        let cartUpdate = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        res.status(200).send({ status: true, data: orderStatus })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { orderCreate, updateOrder }