
const productModel = require('../models/productModel')
const Validator = require('../Validator/valid')
const { uploadFile } = require('../aws/AWS')
 
/*-------------CreatProduct-Api------------*/

const createProduct = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body))
    let files = req.files;

    let { title, description, price, currencyId, currencyFormat, style,  installments,isFreeShipping } = data
    if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data" }) }

    if (!Validator.isValid(title)) return res.status(400).send({ status: false, message: "title is Required" });
    if (!Validator.isValidString(title)) return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })

    let isTitlePresent = await productModel.findOne({ title })
    if (isTitlePresent) return res.status(400).send({ status: false, message: "title is already present" })


    if (!Validator.isValid(description)) return res.status(400).send({ status: false, message: "description is Required" });
    if (!Validator.isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })

    if (!price) return res.status(400).send({ status: false, message: "price is Required" });
    if (!/^[0-9 .]+$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })


      
    if (!currencyId) return res.status(400).send({ status: false, message: "currrencyId is Required" });
    if (["INR"].indexOf(currencyId) == -1) return res.status(400).send({ status: false, message: "currency Id must be INR" })

    if (!currencyFormat) return res.status(400).send({ status: false, message: "currrency formet is Required" });
    if ((["₹"].indexOf(currencyFormat) == -1)) return res.status(400).send({ status: false, message: "currency formet must be ₹ " })
    if(style){
    if (!Validator.isValidString(style)) return res.status(400).send({ status: false, message: "style must be alphabetic characters" })
    }
  if(!Validator.isValid(data.availableSizes)) return res.status(400).send({status:false,msg:"availableSize required"})
    let sizes = data.availableSizes.split(/[\s,]+/)
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        console.log(sizes)
        for (let i = 0; i < sizes.length; i++) {
            if (arr.indexOf(sizes[i]) == -1)
                return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
        }
       data["availableSizes"]= sizes
        


    if(installments){
    if (!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })
    }
    if (isFreeShipping) {
      if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {return res.status(400).send({status: false,massage: 'isFreeShipping should be a boolean value'})
  }}
    
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    } else {
      return res.status(400).send({ msg: "Product image is required" });
    }


    let savedData = await productModel.create(data)
    return res.status(201).send({ status: true, message: "product created successfully", data: savedData })

  }
  catch (err) {
    return res.status(500).send({ status: false, error: err.message })
  }
}
/*----------getProductById---------------------*/

const getProductById = async function (req, res) {
  try {
    const productId = req.params.productId
if (!Validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

    
    const productData = await productModel.findOne({ _id: productId, isDeleted: false })

    if (!productData) return res.status(404).send({ status: false, message: "product is not found or product is deleted" })
    return res.status(200).send({ status: true, message: "success", data: productData })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })

  }
}
/*-----------getProduct-Api-------------*/
const getProduct = async function (req, res) {
  try {
    let filter = req.query;
    let query = { isDeleted: false };
    if (filter) {
      const { name, description, isFreeShipping, style, size, installments} =
        filter;
    
      if (name) {
        if (!Validator.isValidString(name)) return res.status(400).send({ status: false, message: "name  must be alphabetic characters" })
        query.title = name;
      }
      if (description) {
        if (!Validator.isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })
        query.description = description.trim();

      }
      if (isFreeShipping) {
          if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {return res.status(400).send({status: false,massage: 'isFreeShipping should be a boolean value'})
      }
        query.isFreeShipping = isFreeShipping;
      }
      if (style) {
        if (!Validator.isValidString(style)) return res.status(400).send({ status: false, message: "style  must be alphabetic characters" })
        query.style = style.trim();
      }
      if (installments) {
        if(!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

        query.installments = installments;
      }
      if (size) {
        let sizes = size.split(/[\s,]+/)
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        console.log(sizes)
        for (let i = 0; i < sizes.length; i++) {
            if (arr.indexOf(sizes[i]) == -1)
                return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
        }
        const sizeArr = size
          .trim()
          .split(",")
          .map((x) => x.trim());
        query.availableSizes = { $all: sizeArr };
      }
    }
    if(filter.priceLessThan){
      if (!/^[0-9 .]+$/.test(filter.priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be in numeric" })
    }
    if(filter.priceGreaterThan){
      if (!/^[0-9 .]+$/.test(filter.priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be in numeric" })
    }

    const query1 = await constructQuery(filter); // line-164
    let data = await productModel.find({ ...query, ...query1 }).collation({ locale: "en", strength: 2 }).sort({ price: filter.priceSort });

    if (data.length == 0) {
      return res.status(400).send({ status: false, message: "NO data found" });
    }

    return res.status(200).send({status: true,message: "Success",count: data.length,data: data});
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const constructQuery = async (filter) => {
  if (filter.priceGreaterThan && filter.priceLessThan) {
    return {
      $and: [
        { price: { $gt: filter.priceGreaterThan, $lt: filter.priceLessThan } },
      ],
    };
  } else if (filter.priceGreaterThan) {
    return { price: { $gt: filter.priceGreaterThan } };
  } else if (filter.priceLessThan) {
    return { price: { $lt: filter.priceLessThan } };
  }
};

/*-------------delete-api--------------*/

const deleteProduct = async function (req, res) {
  let productId = req.params.productId;


  if (!Validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

  let alreadyDeleted = await productModel.findById(productId)
  if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found" })
  if (alreadyDeleted.isDeleted == false) {

    let deletePro = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { isDeleted: true, deletedAt: new String(Date()) }, { new: true }
    );

    return res.status(200).send({ status: true, message: "product deleted successfully", data: deletePro });
  } else {
    return res.status(400).send({ status: false, message: "product is already deleted" });
  }
};

/*-----------Update/put Api---------------------*/


const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let data = req.body;

    if (!Validator.isValidObjectId(productId)) {
    return res.status(400).send({ status: false, message: "Invalid productId" })}


    let alreadyDeleted = await productModel.findOne({_id:productId, isDeleted:false})
  if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found" })

    let { title, description, price, currencyId, currencyFormat, style, installments } = data

    if (!Validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please enter data for update" }) }
    if (title)
      if (!Validator.isValidString(title)) return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })
    let isTitlePresent = await productModel.findOne({ title })
    if (isTitlePresent) return res.status(400).send({ status: false, message: "title is already present" })

    if (description)

      if (!Validator.isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })

    if (price)
      if (!/^[0-9 .]+$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })

    if (currencyId)
      if ((["INR"].indexOf(currencyId) == -1)) return res.status(400).send({ status: false, message: "currency Id must be INR" })

    if (currencyFormat)
      if ((["₹"].indexOf(currencyFormat) == -1)) return res.status(400).send({ status: false, message: "currency formet must be ₹ " })

    if (style)
      if (!Validator.isValidString(style)) return res.status(400).send({ status: false, message: "style must be alphabetic characters" })
    if (data.availableSizes){
    let sizes = data.availableSizes.split(/[\s,]+/)
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        console.log(sizes)
        for (let i = 0; i < sizes.length; i++) {
            if (arr.indexOf(sizes[i]) == -1)
                return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
        }
       data["availableSizes"]= sizes
      }

    if (installments)
      if (!/^[0-9 ]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

    let files = req.files;
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    }

    let updatedData = await productModel.findOneAndUpdate({ _id: productId },data,{new: true});
    return res.status(200).send({status: true,message: "product details updated", data: updatedData,});
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
module.exports = { createProduct, getProduct, getProductById, deleteProduct, updateProduct }
