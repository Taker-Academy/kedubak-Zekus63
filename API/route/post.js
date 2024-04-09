const express = require("express");
const router = express.Router();
const connectDB = require('../complement/mongo');
const token = require('../complement/token');
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    console.log("GET: /post/");
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

                const postCollection = database.collection('Post');
                const listPost = await postCollection.find({}).toArray();

                res.status(200).json(
                    {
                        "ok": true,
                        "data": listPost
                    }
                );
            }
        } catch (error) {
            console.error("Error registering post:", error);
            res.status(500).json(
                {
                    "ok": false,
                    "error": "Erreur interne du serveur.",
                }
            );
        }
    }
})

router.post('/', async (req, res) => {
    console.log("POST: /post/");
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

                if (typeof body !== "object" || Object.keys(body).length !== 2 ||
                    !body.title || !body.content ||
                    typeof body.title !== "string"|| typeof body.content !== "string") {
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
                        createdAt: date,
                        userId: User._id,
                        firstName: User.firstName,
                        title: body.title,
                        content: body.content,
                        comments: [],
                        upVotes: []
                    }
                    const Datainser = await postCollection.insertOne(InsertData);
                    const postId = Datainser.insertedId;
                    InsertData._id = postId;
                    res.status(201).json(
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

router.get('/me', async (req, res) => {
    console.log("GET: /post/me");
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
                const userCollection = database.collection('User');
                const postCollection = database.collection('Post');
                var date = new Date();

                const UserListPost =  await postCollection.find({ userId: new ObjectId(_id)}).toArray();
                res.status(200).json(
                    {
                        "ok": true,
                        "data": UserListPost
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

router.get('/:id', async (req, res) => {
    console.log("GET: /post/:id");
    const postId = req.params['id'];

    if (!postId) {
        res.status(400).json(
            {
                "ok": false,
                "error": "Mauvaise requête, paramètres manquants ou invalides.",
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
                const userCollection = database.collection('User');
                const postCollection = database.collection('Post');
                const postSearch = await postCollection.findOne({ _id: new ObjectId(postId)});

                if (postSearch) {
                    res.status(200).json(
                        {
                            "ok": true,
                            "data": postSearch
                        }
                    )
                } else {
                    res.status(404).json(
                        {
                            "ok": false,
                            "error": "Élément non trouvé.",
                        }
                    );
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

router.delete('/:id', async (req, res) => {
    console.log("DELETE: /post/:id");
    const postId = req.params['id'];

    if (!postId) {
        res.status(400).json(
            {
                "ok": false,
                "error": "Mauvaise requête, paramètres manquants ou invalides.",
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
                const userCollection = database.collection('User');
                const postCollection = database.collection('Post');
                const postSearch = await postCollection.findOne({ _id: new ObjectId(postId)});

                if (postSearch) {
                    if (!await postCollection.findOne({ _id: new ObjectId(postId), userId: User._id })) {
                        res.status(403).json(
                            {
                                "ok": false,
                                "error": "L'utilisateur n'est pas le propriétaire de l'élément.",
                            }
                        );
                        return;
                    } else {
                        await postCollection.deleteOne({ _id: new ObjectId(postId)});
        
                        postSearch.remove = true;
                        res.status(200).json(
                            {
                                "ok": true,
                                "data": postSearch
                            }
                        )
                    }
                } else {
                    res.status(404).json(
                        {
                            "ok": false,
                            "error": "Élément non trouvé.",
                        }
                    );
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

router.post('/vote/:id', async (req, res) => {
    console.log("POSTE: /post/vote/:id");
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
                var date = new Date();
                date.setMinutes(date.getMinutes() - 1);
                if (User.lastUpVote > date) {
                    res.status(403).json(
                        {
                            "ok": false,
                            "error": "Vous ne pouvez voter que toutes les minutes.",
                        }
                    );
                    return;
                }
                const userCollection = database.collection('User');
                const postCollection = database.collection('Post');
                const postSearch = await postCollection.findOne({ _id: new ObjectId(postId)});

                if (postSearch) {
                    const listVotest = await postSearch.upVotes;
                    if (await postCollection.findOne({ _id: new ObjectId(postId), upVotes: User._id })) {
                        res.status(409).json(
                            {
                                "ok": false,
                                "error": "Vous avez déjà voté pour ce post.",
                            }
                        );
                        return;
                    } else {
                        await postCollection.updateOne({ _id: new ObjectId(postId)}, { $push: { upVotes: User._id } });
                        const newdate = new Date();
                        await userCollection.updateOne({ _id: User._id},  { $set: { lastUpVote: newdate } });
        
                        res.status(200).json(
                            {
                                "ok": true,
                                "message": "post upvoted"
                            }
                        )
                    }
                } else {
                    res.status(404).json(
                        {
                            "ok": false,
                            "error": "Élément non trouvé.",
                        }
                    );
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