const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controllers/userController")
const productController=require("../Controllers/productController")
const cartController=require("../Controllers/cartController")
const orderController=require("../Controllers/orderController")
const {Authentication,Authorization} =require('../middleware/auth')

//User APIs
router.post("/register",userController.userCreate);
router.post("/login",userController.Login);
router.get("/user/:userId/profile",Authentication,Authorization,userController.getUserById)
router.put("/user/:userId/profile",Authentication,Authorization,userController.updatedUser)
//Product APIs
router.post("/products",productController.createProduct)
router.get("/products/:productId",productController.getProductById)
router.get('/products',productController.getProduct)
router.delete("/products/:productId",productController.deleteProduct)
router.put("/products/:productId",productController.updateProduct)

//cart Apis
router.post("/users/:userId/cart",Authentication,Authorization,cartController.createCart)
router.put("/users/:userId/cart",Authentication,Authorization,cartController.updateCart)
router.get("/users/:userId/cart",Authentication,Authorization,cartController.getCart)
router.delete("/users/:userId/cart",Authentication,Authorization,cartController.deleteCart)


//order apis
router.post("/users/:userId/orders",Authentication,Authorization,orderController.orderCreate)
router.put("/users/:userId/orders",Authentication,Authorization,orderController.updateOrder)
//export router
module.exports = router;
