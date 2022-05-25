const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')
const aws = require("aws-sdk")
var validator = require("email-validator");
const bcrypt = require('bcrypt');