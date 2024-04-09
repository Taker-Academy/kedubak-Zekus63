const express = require("express");
const router = express.Router();
const connectDB = require('../complement/mongo');
const token = require('../complement/token');
const crypt = require('../complement/crypter');


router.post("/login", async (req, res) => {
    console.log("POST: /auth/login");
    try {
        const database = await connectDB();
        const body = req.body;
        if (typeof body !== "object" || Object.keys(body).length !== 2 ||
            !body.email || !body.password ||
            typeof body.email !== "string"|| typeof body.password !== "string") {
            res.status(400).json(
                {
                    "ok": false,
                    "error": "Mauvaise requête, paramètres manquants ou invalides.",
                }
            );
        } else {
            const loginUser = await database.collection('User').findOne({ email: body.email});
            if (loginUser === null ||
                !await crypt.verif(body.password, loginUser.password)) {
                res.status(401).json(
                    {
                        "ok": false,
                        "error": "Mauvais identifiants.",
                    }
                );
                return;
            }
            const mytoken = token.create({ _id: loginUser._id });
            res.status(200).json(
                {
                    "ok": true,
                    "data": {
                        "token": mytoken,
                        "user": {
                            "email": loginUser.email,
                            "firstName": loginUser.firstName,
                            "lastName": loginUser.lastName
                        }
                    }
                }
            )
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json(
            {
                "ok": false,
                "error": "Erreur interne du serveur.",
            }
        );
    }
})

router.post('/register', async (req, res) => {
    console.log("POST: /auth/register");
    try {
        const database = await connectDB();
        const body = req.body;
        if (typeof body !== "object" || Object.keys(body).length !== 4 ||
            !body.email || !body.password || !body.firstName || !body.lastName ||
            typeof body.email !== "string"|| typeof body.password !== "string"|| typeof body.firstName !== "string"|| typeof body.lastName !== "string") {
            res.status(400).json(
                {
                    "ok": false,
                    "error": "Mauvaise requête, paramètres manquants ou invalides.",
                }
            );
        } else {
            if (await database.collection('User').findOne({ email: body.email})) {
                res.status(401).json(
                    {
                        "ok": false,
                        "error": "Mauvais identifiants.",
                    }
                );
                return;
            }
            const User = await database.collection('User');
            var date = new Date();
            var newdate = new Date();
            newdate.setMinutes(newdate.getMinutes() - 1);
            const InsertData = {
                createdAt: date,
                email: body.email,
                firstName: body.firstName,
                lastName: body.lastName,
                password: await crypt.create(body.password),
                lastUpVote: new Date(newdate),
            }
            console.log(await crypt.create(body.password));
            const DataInser = await User.insertOne(InsertData);
            const UserData = await User.findOne({ email: body.email});
            const mytoken = token.create({ _id: UserData._id });
            res.status(201).json(
                {
                    "ok": true,
                    "data": {
                        "token": mytoken,
                        "user": {
                            "email": UserData.email,
                            "firstName": UserData.firstName,
                            "lastName": UserData.lastName
                        }
                    }
                }
            )
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json(
            {
                "ok": false,
                "error": "Erreur interne du serveur.",
            }
        );
    }
})


module.exports = router;