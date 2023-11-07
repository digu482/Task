const multer = require("multer");
const fs = require("fs");
const User = require("../model/user");
const maxSize = 5 * 1024 * 1024;
const msg = require("../utils/ResponseMessage.json");
const { log } = require("console");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profile") {
      cb(null, "public/profile");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = file.originalname.split(".").pop();
    const filename = `profile_${timestamp}.${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("profile");

async function uploadFile(req, res, next) {
  upload(req, res, async (error) => {
    console.log({ error });
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        status: 400,
        message: "File size is too large or invalid file format",
      });
    } else if (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    } else {
      if (req.file) {
        const profileFilename = req.file.filename;
        req.profile = profileFilename;

        if (req.user) {
          req.profile = profileFilename;
          await req.user.save();
        }

        if (req.oldProfileFilename) {
          const oldProfilePath = `public/profile/${req.oldProfileFilename}`;
          fs.unlink(oldProfilePath, (err) => {
            if (err) {
              console.error(`Error deleting old profile file: ${err}`);
            } else {
              console.log(`Old profile file deleted: ${oldProfilePath}`);
            }
          });
        }
        req.oldProfileFilename = profileFilename;
      }
      next();
    }
  });
}

module.exports = uploadFile;
