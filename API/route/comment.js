const express = require("express");
const router = express.Router();
const connectDB = require('../complement/mongo');
const token = require('../complement/token');
const { ObjectId } = require("mongodb");

router.post('/:id', async (req, res) => {
    console.log("POST: /comment/:id");
    const postId = req.params['id'];

    if (!postId) {
        res.status(422).json(
            {
                "ok": false,
                "error": "ID invalide.",
            }
        );
        return;
    }
    const tokenData = token.verif(req);
    if (tokenData.code === 401) {
        res.status(401).json(
            {
                "ok": false,
                "error": "Mauvais token JWT.",
            }
        );
        return;
    } else {
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
                const body = req.body;

                if (typeof body !== "object" || Object.keys(body).length !== 1 ||
                    !body.content || typeof body.content !== "string") {
                    res.status(400).json(
                        {
                            "ok": false,
                            "error": "Mauvaise requête, paramètres manquants ou invalides.",
                        }
                    );
                } else {
                    const postCollection = database.collection('Post');
                    var date = new Date();

                    const InsertData = {
                        firstName: User.firstName,
                        content: body.content,
                        createdAt: Date.now(),
                        id: new ObjectId()
                    }
                    const Datainser = await postCollection.updateOne({ _id: new ObjectId(postId)}, { $push: { comments: InsertData } });
                    InsertData._id = Datainser.insertedId;
                    res.status(200).json(
                        {
                            "ok": true,
                            "data": InsertData
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


module.exports = router;