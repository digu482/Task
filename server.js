const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors")
require("dotenv").config();
require("./src/config/db")
const userRouters = require("./src/route/user.route")
const adminRouters = require("./src/route/admin.route")
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/user",userRouters)
app.use("/admin",adminRouters)


app.listen(PORT, () => {
    console.log(`Server Successfully Connected port no ${PORT}`);
});