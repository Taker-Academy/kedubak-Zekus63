const express = require("express");
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
let connectDB = require('./complement/mongo');

const app = express();

connectDB();
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send({messade: "Bienvenu !"})
})

const auth = require("./route/auth") 
app.use("/auth", auth);

const user = require("./route/user")
app.use("/user", user);

const post = require("./route/post")
app.use("/post", post);

const comment = require("./route/comment")
app.use("/comment", comment);

app.listen(8080, () => {
    console.log("server listening on port 8080");
})

module.exports = () => {
    return client;
}
