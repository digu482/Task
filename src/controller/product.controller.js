const Product = require("../model/product");
const msg = require("../utils/ResponseMessage.json");

exports.productcreate = async (req, res) => {
  try {
    const { ProductName } = req.body;
    const existingProduct = await Product.findOne({ ProductName });

    if (existingProduct) {
      return res.status(400).json({
        status: 400,
        message: msg.NOTMATCH,
      });
    }

    const productImage = req.profile;
    const product = new Product({
      ProductName,
      productImage,
    });

    product.save().then(async (data, error) => {
      if (error) {
        return res.status(400).json({
          status: 400,
          message: msg.NOTCREATE,
        });
      } else {
        return res.status(201).json({
          status: 201,
          message: msg.CREATE,
          data: data,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};



exports.ProductView = async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    }

    if (product.Status === "Pending") {
      return res.status(200).json({
        status: 200,
        message: msg.NOTVIEW,
      });
    } else if (product.Status === "Add") {
      return res.status(200).json({
        status: 200,
        message: msg.SHOW,
        data: product,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: msg.NOTSHOW,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};



exports.updateproduct = async (req, res) => {
    
  try {
    const { ProductName, _id } = req.body;
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    }
    console.log({ product });

    if (product.Status === "Pending") {
      return res.status(200).json({
        status: 200,
        message: msg.NOUPDATE,
      });
    } else if (product.Status === "Add") {
      const profileImage = req.params.profile;
      console.log({ productImage });
      let updatedProduct = {
        ProductName,
        productImage: profileImage,
      };

      await Product.findByIdAndUpdate(_id, updatedProduct, {
        useFindAndModify: false,
      });

      return res.status(200).json({
        status: 200,
        message: msg.UPDATESUCC,
        updatedProduct,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: msg.NOTSHOW,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
