const User = require("../model/user");
const bcrypt = require("bcrypt");
const { passwordencrypt } = require("../services/commonservices");
const { passwordvalidation } = require("../services/commonservices");
const { NameValidation } = require("../services/commonservices");
const { EmailValidation } = require("../services/commonservices");
require("dotenv").config();
const multer = require("multer");
const msg = require("../utils/ResponseMessage.json");
// const { userverifyToken } = require("../middleware/Auth");
const jwt = require("jsonwebtoken");
const { generateJwt } = require("../utils/jwt");
const uploadFile = require("../middleware/upload")


exports.create = async (req, res) => {
    try {
      let { Name, email, companyName, phone, password, role, Status } = req.body;
  
      const existUser = await User.findOne({
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
    
    if (role === "Seller" && !companyName) {
        return res.status(400).json({
          status: 400,
          message: msg.COMPANYFORMAT,
        });
      }
      const existEmail = await User.findOne({ email });
  
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
  
      if (!existUser) {
        password = await passwordencrypt(password);
        email = email.toLowerCase();
        const profile = req.profile;
        const Timestamp = new Date();
        let user = new User({
          Name,
          email,
          companyName,
          phone,
          Status,
          role,
          profile,
          password,
          Timestamp,
        });
  
        user.save().then(async (data, error) => {
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


  

exports.UserLogin = async (req, res) => {
    try {
      let { email, password,role } = req.body;
      let userLogin = await User.findOne({ email });
      if (!userLogin) {
        return res.status(404).json({
          status: 404,
          error: true,
          message: msg.NOTFOUND,
        });
      } else {
        if (userLogin.Status === 'Pending') {
          return res.status(400).json({
            status: 400,
            error: true,
            message: msg.ISPENDING,
          });
        } else if (userLogin.Status === 'Rejected') { 
          return res.status(400).json({
            status: 400,
            error: true,
            message: msg.REJECTTED,
          });
        } else {
          const isvalid = await bcrypt.compare(password, userLogin.password);

          if (!isvalid) {
            return res.status(400).json({
              status: 400,
              error: true,
              message: msg.NOTMATCH,
            });
          } else {
            const { error, token } = await generateJwt(userLogin._id,userLogin.role);
            if (error) {
              return res.status(400).json({
                status: 400,
                error: true,
                message: msg.TOKEN,
              });
            } else {
              await User.findOneAndUpdate(
                { _id: userLogin._id },
                { $set: { token: token } },
                { useFindAndModify: false }
              );
              let loginMessage = '';
              if (userLogin.role === 'Seller') {
                loginMessage = msg.SLOGIN;
              } else {
                loginMessage = msg.ULOGIN;
              }
              return res.status(200).json({
                status: 200,
                success: true,
                token: token,
                userLogin: email,
                message: loginMessage,
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
        message: msg.NOTSUCCESS,
      });
    }
}




exports.logout = async (req, res) => {
    try {
      const userId = req.currentUser;
      await User.findById(userId);
        await User.findByIdAndUpdate(userId, { $set: { token: "" } }, { useFindAndModify: false });
        return res.status(200).json({
          status: 200,
          Msg: msg.LOGOUT,
        });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
};




exports.Allfind = async (req, res) => {
    try {
      // let userdata = await User.find();

      // let userdata = await User.aggregate(
      //   [ { $group : { _id : "$Name" } } ]
      // )

      // let userdata = await User.aggregate([ { $limit: 2 } ])

      // let userdata = await User.aggregate([
      //   {
      //     $project: {
      //       "Name": 1,
      //       "email": 1,
      //       "Status": 1
      //     }
      //   },
      //   {
      //     $limit: 5
      //   }
      // ])

      // let userdata = await User.aggregate([ 
      //   { 
      //     $sort: { "Name": -1 } 
      //   },
      //   {
      //     $project: {
      //       "Name": 1,
      //       "email": 1
      //     }
      //   },
      //   {
      //     $limit: 5
      //   }
      // ])

      // let userdata = await User.aggregate([ 
      //   { $match : { Status : "Approve" } },
      //   { $limit: 2 },
      //   { $project: {
      //     "Name": 1,
      //     "email": 1,
      //     "phone": 1
      //   }}
      // ])

      // let userdata = await User.aggregate([
      //   {
      //     $match: { Status : "Approve" }
      //   },
      //   {
      //     $count: "totalApprove"
      //   }
      // ])

      let userdata = await User.aggregate([
        {
          $lookup: {
            from: 'products', 
            localField: 'createdBy', 
            foreignField: 'productName', 
            as: 'products' 
          }
        }
      ]);
      if (!userdata) {
        return res.status(404).json({
          status: 404,
          error: true,
          message: msg.NOTFOUND,
        });
      } else {
        res.status(201).json({
          status: 201,
          userdata,
          message: msg.LOGIN,
        });
      }
    } catch (error) {
      console.log(error);
    }
};
  


  
     
exports.find = async (req, res) => {
    try {
      let userdata = await User.findById({ _id: req.currentUser });
      if (!userdata) {
        return res.status(404).json({
          status: 404,
          error: true,
          message: msg.NOTFOUND,
        });
      } else {
        res.status(201).json({
          status: 201,
          userdata,
          message: msg.LOGIN1,
        });
      }
    } catch (error) {
      console.log(error);
    }
};  




exports.softdelete = async (req, res) => {
    try {
      const userId = req.currentUser;
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: msg.NOTFOUND,
        });
      } else {
        await User.findByIdAndUpdate(
          userId,
          { $set: { Status: "Pending" } },
          { useFindAndModify: false }
        );
        return res.status(200).json({
          status: 200,
          Msg: msg.DELETE,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        message: error.message,
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





exports.CreateOrUpdate = async (req, res) => {
    try {
      let { Name, email, companyName, phone, password, role, Status } = req.body;
      let _id = req.currentUser;

      //Update 
      if (_id) {
        let user = await User.findById(_id);
        if (!user) {
          return res.status(404).json({
            status: 404,
            message: msg.NOTFOUND,
          });
        }
  
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
  
        let updatedUser = {
          Name,
          email,
          companyName,
          phone,
        };
        await User.findByIdAndUpdate(_id, updatedUser, {
          useFindAndModify: false,
        });
        return res.status(200).json({
          status: 200,
          message: msg.USERUPDSUCC,
        });
      } else {
        // Create a new User/Seller
        const existUser = await User.findOne({
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
  
        if (role === "Seller" && !companyName) {
            return res.status(400).json({
              status: 400,
              message: msg.COMPANYFORMAT,
            });
          }
  
        const existEmail = await User.findOne({ email });
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
  
        if (!existUser) {
          password = await passwordencrypt(password);
          email = email.toLowerCase();
          const profile = req.profile;
          const Timestamp = new Date();
          let user = new User({
            Name,
            email,
            companyName,
            phone,
            Status,
            role,
            profile,
            password,
            Timestamp,
          });
  
          user.save().then(async (data, error) => {
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
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: msg.ERROR
      });
    }
};
  
              
  




  