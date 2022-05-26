const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controllers/userController")
const productController=require("../Controllers/productController")
const auth=require("../middleware/auth")
router.post("/register",userController.userCreate)

router.post("/login",userController.Login);

router.get("/user/:userId/profile",auth.authentication,userController.getUserById)


router.put("/user/:userId/profile",userController.updatedUser)



router.post("/products")

//export router
module.exports = router;