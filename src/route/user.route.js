const express = require('express')
const router = express.Router()
const controller = require("../controller/user.conroller")
const productcontroller = require("../controller/product.controller")
const {userverifyToken ,restrict} = require("../middleware/auth")
const uploadFile = require("../middleware/upload")


// User And Seller Route
router.post("/create",uploadFile,controller.create)
router.post("/login",controller.UserLogin)
router.post("/logout",controller.logout)
router.get("/findall",controller.Allfind)
router.get("/find",userverifyToken,controller.find)
router.delete("/softdelete",userverifyToken,controller.softdelete)
router.patch("/update",userverifyToken,uploadFile,controller.updatedata)
router.post("/CreateOrUpdate",uploadFile,controller.CreateOrUpdate)


// Product Route
router.post("/productcreate",userverifyToken,uploadFile,restrict("User"),productcontroller.productcreate)
router.get("/productview",productcontroller.ProductView)
router.patch("/updateproduct",uploadFile,productcontroller.updateproduct)


module.exports = router