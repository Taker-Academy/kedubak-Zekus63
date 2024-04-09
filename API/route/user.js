const express = require("express");
const router = express.Router();
const connectDB = require('../complement/mongo');
const token = require('../complement/token');
const { ObjectId } = require("mongodb");
const crypt = require('../complement/crypter');

router.get("/me", async (req, res) => {
    console.log("GET: /user/me");
    const tokenData = token.verif(req);
    if (tokenData.code === 401) {
        res.status(401).json(
            {
                "ok": false,
                "error": "Mauvais token JWT.",
            }
        );
        return;
    }
    else {
        try {
            const _id = tokenData.data._id;
            const database = await connectDB();
            const User = await database.collection('User').findOne({ _id: new ObjectId(_id) });

            if (!User) {
                res.status(401).json(
                    {
                        "ok": false,
                        "error": "Mauvais token JWT.",
                    }
                );
                return;
            } else {
                res.status(200).json(
                    {
                        "ok": true,
                        "data": {
                            "email": User.email,
                            "firstName": User.firstName,
                            "lastName": User.lastName
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
    }
})

router.put("/edit", async (req, res) => {
    console.log("PUT: /user/edit");
    const tokenData = token.verif(req);
    if (tokenData.code === 401) {
        res.status(401).json(
            {
                "ok": false,
                "error": "Mauvais token JWT.",
            }
        );
        return;
    }
    else {
        try {
            const _id = tokenData.data._id;
            const database = await connectDB();
            const User = await database.collection('User').findOne({ _id: new ObjectId(_id) })
            
            if (!User) {
                res.status(401).json(
                    {
                        "ok": false,
                        "error": "Mauvais token JWT.",
                    }
                );
                return;
            } else {
                const body = req.body;
                // (typeof body.email !== "string" || await database.collection('User').findOne({ email: body.email})._id != _id)
                if (Object.keys(body).length > 4 ||
                    (body.firstName && typeof body.firstName !== "string") ||
                    (body.lastName && typeof body.lastName !== "string") ||
                    (body.email && typeof body.email !== "string") ||
                    (body.password && typeof body.password !== "string")) {
                    res.status(422).json(
                        {
                            "ok": false,
                            "error": "Échec de validation des paramètres.",
                        }
                    );
                } else {
                    const userCollection = database.collection('User');
                    const postCollection = database.collection('Post');
                    if (body.firstName) {
                        userCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { firstName: body.firstName } });
                    }
                    if (body.lastName) {
                        userCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { lastName: body.lastName } });
                    }
                    if (body.email) {
                        userCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { email: body.email } });
                    }
                    if (body.password) {
                        userCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { password: await crypt.create(body.password) } });
                    }

                    const loginUser = await userCollection.findOne({ _id: new ObjectId(_id) });
                    await postCollection.updateMany({ userId: new ObjectId(_id) }, { $set: { firstName: loginUser.firstName }});
                    res.status(200).json(
                        {
                            "ok": true,
                            "data": {
                                "email": loginUser.email,
                                "firstName": loginUser.firstName,
                                "lastName": loginUser.lastName
                            }
                        }
                    )
                }
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
    }
})

router.delete("/remove", async (req, res) => {
    console.log("DELETE: /user/remove");
    const tokenData = token.verif(req);
    if (tokenData.code === 401) {
        res.status(401).json(
            {
                "ok": false,
                "error": "Mauvais token JWT.",
            }
        );
        return;
    }
    else {
        try {
            const _id = tokenData.data._id;
            const database = await connectDB();
            const User = await database.collection('User').findOne({ _id: new ObjectId(_id) })
            
            if (!User) {
                res.status(404).json(
                    {
                        "ok": false,
                        "error": "Utilisateur non trouvé.",
                    }
                );
                return;
            } else {
                const body = req.body;

                const userCollection = database.collection('User');
                const postCollection = database.collection('Post');
                const loginUser = await userCollection.findOne({ _id: new ObjectId(_id) });
                await userCollection.deleteOne({ _id: new ObjectId(_id) });
                await postCollection.deleteMany({ userId: new ObjectId(_id) });

                res.status(200).json(
                    {
                        "ok": true,
                        "data": {
                            "email": loginUser.email,
                            "firstName": loginUser.firstName,
                            "lastName": loginUser.lastName,
                            "removed": true
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
    }
})

module.exports = router;