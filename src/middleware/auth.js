const jwt = require('jsonwebtoken');
const Validator = require("../Validator/valid");
const userModel = require('../models/userModel')


const Authentication = async function (req, res, next) {
    try {
        // getting token from req(header)
        let token = req.headers["Authorization"];
        if (!token) token = req.headers["authorization"];
        if (!token) { return res.status(400).send({ status: false, msg: "Enter Authorization In Header" }); }
        // token verification
        let token1 = token.split(" ").pop()
       
        jwt.verify(token1, "project5Group49", { ignoreExpiration: true }, function (err, decoded) {
            if (err) { return res.status(400).send({ status: false, meessage: "token invalid" }) }
            else {
                //The static Date.now() method returns the number of milliseconds elapsed since January 1, 1970
                if (Date.now() > decoded.exp * 1000) {
                    return res.status(401).send({ status: false, msg: "Session Expired", });
                }
                req.userId = decoded.userId;
                next();
            }
        });

    }
    catch (err) {
        res.status(500).send({ msg: err.message });
    }
}
module.exports.Authentication = Authentication;


const Authorization = async function (req, res, next) {
    try {
        let token = req.headers["Authorization"];
        if (!token) token = req.headers["authorization"]; //taking the x-api-key of value token in headers
        // check the token are prenent or not in headers
        if (!token) { return res.status(400).send({ status: false, msg: "Enter Authorization In Header"}); }
        // verify the token
        let token1 = token.split(" ").pop() 
        let decodedToken = jwt.verify(token1, "project5Group49")
        let decoded = decodedToken.userId
        const userId = req.params.userId
        // check the user id present in body
        if (!Validator.isValid(userId)) return res.status(400).send({ status: false, message: "userId is Required" });

        if (!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not valid" });
        //check the  user id are present in decoded token
        let User = await userModel.findById(userId)
        if (!User) return res.status(404).send({ status: false, msg: "User not exist" })

        if (userId != decoded) { return res.status(401).send({ status: false, msg: "Not Authorised!!" }) }

        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}
module.exports.Authorization = Authorization;