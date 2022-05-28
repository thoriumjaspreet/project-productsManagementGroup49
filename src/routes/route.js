const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controllers/userController")
const productController=require("../Controllers/productController")
const {Authentication,Authorization} =require('../middleware/auth')

//User APIs
router.post("/register",userController.userCreate);
router.post("/login",userController.Login);
router.get("/user/:userId/profile",Authentication,Authorization,userController.getUserById)
router.put("/user/:userId/profile",Authentication,userController.updatedUser)
//Product APIs
router.post("/products",productController.createProduct)
router.get("/products/:productId",productController.getProductById)
router.get('/products',productController.getProduct)

router.get("/products/:productId",productController.getProductById)

router.put("/products/:productId",productController.updateProduct)
//export router
module.exports = router;