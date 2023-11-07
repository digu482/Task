const User = require("../model/user");
const Admin = require("../model/admin");
const Product = require("../model/product")
const bcrypt = require("bcrypt");
const { passwordencrypt } = require("../services/commonservices");
const { passwordvalidation } = require("../services/commonservices");
const { NameValidation } = require("../services/commonservices");
const { EmailValidation } = require("../services/commonservices");
require("dotenv").config();
const msg = require("../utils/ResponseMessage.json");;
const jwt = require("jsonwebtoken");
const { admingenerateJwt } = require("../utils/jwt");



exports.createadmin = async (req, res) => {
    try {
      let { Name, email, phone, password } = req.body;
  
      const existAdmin = await Admin.findOne({
        $or: [{ email }, { phone }],
      });
  
      if (!Name || !email || !phone || !password) {
        return res.status(400).json({
          status: 400,
          message: msg.REQUIRE,
        });
      }
  
      if (!NameValidation(Name)) {
        return res.status(400).json({
          status: 400,
          message: msg.NAMEFORMAT,
        });
      }
  
      if (!EmailValidation(email)) {
        return res.status(400).json({
          status: 400,
          message: msg.EMAILFORMAT,
        });
      }
    
      const existEmail = await Admin.findOne({ email });
  
      if (existEmail) {
        return res.status(400).json({
          status: 400,
          message: msg.EXISTEMAIL,
        });
      }
  
      if (!passwordvalidation(password)) {
        return res.status(400).json({
          status: 400,
          message: msg.PASSWORDVALID,
        });
      }
  
      if (!existAdmin) {
        password = await passwordencrypt(password);
        email = email.toLowerCase();
        const profile = req.profile;
        let admin = new Admin({
          Name,
          email,
          phone,
          profile,
          password,
        });
  
        admin.save().then(async (data, error) => {
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
      } 
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: msg.ERROR,
      });
    }
};



exports.AdminLogin = async (req, res) => {
  try {
    let { email, mobile, password, } = req.body;
    let adminLogin = await Admin.findOne({
      $or: [
        { email },
        { mobile },
      ],
    });
    if (!adminLogin) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: msg.NOTFOUND,
      });
    } else {
      if (adminLogin.isdelete) {
        return res.status(400).json({
          status: 400,
          error: true,
          message: msg.ISDELETE,
        });
      } else {
        const isvalid = await bcrypt.compare(password, adminLogin.password);
        if (!isvalid) {
          return res.status(400).json({
            status: 400,
            error: true,
            message: msg.NOTMATCH,
          });
        } else {
          const { error, token } = await admingenerateJwt(adminLogin._id);
          if (error) {
            return res.status(400).json({
              status: 400,
              error: true,
              message: msg.TOKEN,
            });
          } else {
            await Admin.findOneAndUpdate({ _id: adminLogin._id }, { $set: { token: token } }, { useFindAndModify: false });
            return res.status(200).json({
              status: 200,
              success: true,
              token: token,
              adminLogin:email,
              message: msg.SUCCESS1,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Login error", err);
    return res.status(400).json({
      status: 400,
      error: true,
      Msg: msg.NOTSUCCESS,
    });
  }
};



exports.adminApproveOrReject = async (req, res) => {
  try {
    const { _id, Request } = req.body;

    if (!_id || !Request) {
      return res.status(400).json({
        status: 400,
        message: msg.NOTMATCH,
      });
    }

    let user = await User.findByIdAndUpdate(_id, { Status: Request });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    }

    if (Request === 'Approve' || Request === 'Reject') {
      return res.status(200).json({
        status: 200,
        message: Request === 'Approve' ? msg.APPROVE : msg.REJECT,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: msg.INVALID,
      });
    }
  } catch (error) {
    console.error(error); 
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};




exports.updatedata = async (req, res) => {
  try {
    const { Name, email, companyName, phone } = req.body;
    const userId = req.currentUser;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
    

      const existEmail = await User.findOne({ email, _id: { $ne: user._id } });

      if (existEmail) {
        return res.status(400).json({
          status: 400,
          message: msg.EXISTEMAIL,
        });
      }
      if (!NameValidation(Name)) {
        return res.status(400).json({
          status: 400,
          message: msg.NAMEFORMAT,
        });
      }
      const profile = req.profile;
      let updatedUser = {
        Name,
        email,
        companyName,
        phone,
        profile,
      };
      await User.findByIdAndUpdate(userId, updatedUser, {
        useFindAndModify: false,
      });
      return res.status(200).json({
        status: 200,
        message: msg.UPDATESUCC,
        updatedUser
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};




exports.admindeleteuser = async (req, res) => {
  try {
    const {_id} = req.body;
    let user = await User.findByIdAndUpdate({_id});
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    } else {
      await User.findByIdAndUpdate(
        _id,
        { $set: { Status: "Pending" } },
        { useFindAndModify: false }
      );
      return res.status(200).json({
        status: 200,
        Msg: msg.DELETE,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};



exports.adminAddOrNoAddProduct = async (req, res) => {
  try {
    const { _id, Request } = req.body;

    if (!_id || !Request) {
      return res.status(400).json({
        status: 400,
        message: msg.NOTMATCH,
      });
    }

    let product = await Product.findByIdAndUpdate(_id, { Status: Request });
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: msg.NOTFOUND,
      });
    }

    if (Request === 'Add' || Request === 'NoAdd') {
      return res.status(200).json({
        status: 200,
        message: Request === 'Add' ? msg.ADD : msg.NOADD,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: msg.INVALID,
      });
    }
  } catch (error) {
    console.error(error); 
    return res.status(500).json({
      status: 500,
      message: msg.ERROR,
    });
  }
};



