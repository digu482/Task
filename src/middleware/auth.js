const express = require('express');
const jwt = require("jsonwebtoken")
const responseMessage = require("../utils/ResponseMessage.json")
const { key_Token,adminkey_Token } = process.env;

// const userverifyToken = (req, res, next) => {
//   const token = req.body.token || req.query.token || req.headers["token"];

//   if (!token) {
//     return res.status(403).json({Msg: responseMessage.AUTH});
//   }
//   try {
//     const decodeToken = jwt.verify(token, key_Token);
//     req.currentUser = decodeToken._id;

//   } catch (error) {
//     return res.status(401).json({Msg: "Invalid token"});
//   }
//   return next()
// }
const userverifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["token"];

  if (!token) {
    return res.status(403).json({ Msg: responseMessage.AUTH });
  }
  try {
    const decodeToken = jwt.verify(token, key_Token);
    req.currentUser = {
      _id: decodeToken._id,
      role: decodeToken.role, 
    };

  } catch (error) {
    return res.status(401).json({ Msg: "Invalid token" });
  }
  return next();
}




const adminverifyToken = (req, res, next) => {
  const admintoken = req.body.token || req.query.token || req.headers["token"];

  if (!admintoken) {
    return res.status(403).json({Msg: responseMessage.AUTH});
  }
  try {
    const decodeToken = jwt.verify(admintoken, adminkey_Token);
    req.currentadmin = decodeToken._id;
  } catch (error) {
    return res.status(401).json({Msg:"Invalid token" });
  }
  return next()
}



// const restrict = (...allowedRoles) => {
//   return (req, res, next) => {
//     const userRoles = req.currentUser && req.currentUser.Role;

//     if (!userRoles) {
//       return res.status(403).json({ message: "Access denied! User roles are not defined." });
//     }

//     const isAllowed = allowedRoles.some((Role) => userRoles.includes(Role));

//     if (isAllowed) {
//       next();
//     } else {
//       res.status(403).json({ message: "Access denied! You don't have the rights to access this resource." });
//     }
//   };
// };

const restrict = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.currentUser.role;

    if (!userRoles) {
      return res.status(403).json({ message: "Access denied! User roles are not defined." });
    }

    const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

    if (isAllowed) {
      next();
    } else {
      res.status(403).json({ message: "Access denied! You don't have the rights to access this resource." });
    }
  };
};




module.exports = {
  userverifyToken,
  adminverifyToken,
  restrict
}