const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controllers/userController")

router.post("/register",userController.userCreate)

router.post("/login",userController.Login);

router.get("/user/:userId/profile",userController.getUserById)

//export router
module.exports = router;