const express = require('express')
const router = express.Router()
const Admin = require("../model/admin");
const controller = require("../controller/admin.controller")
const {adminverifyToken} = require("../middleware/auth");
const uploadFile = require("../middleware/upload")

router.post("/createadmin",uploadFile,controller.createadmin)

router.post("/adminlogin",controller.AdminLogin)

router.post("/approvereject",controller.adminApproveOrReject)

router.delete("/admindeleteuser",adminverifyToken,controller.admindeleteuser)

router.post("/addnoaddproduct",adminverifyToken,controller.adminAddOrNoAddProduct)

module.exports = router