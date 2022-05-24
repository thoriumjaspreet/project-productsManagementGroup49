const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
  
    return false
}
