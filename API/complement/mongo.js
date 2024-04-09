const { MongoClient } = require('mongodb');
require('dotenv').config();
let database;

let connectDB = async () => {
    if (database) return database; // return if database already connected. 
    const client = new MongoClient(process.env.MONGO_URL);

    try {
        await client.connect();
        database = client.db('keduback');
        console.log('Connected to Database');
        const collectionlist = await database.listCollections().toArray();
        if (collectionlist.some(obj => obj.name === "User") == false) {
            await database.createCollection("User");
        }
        if (collectionlist.some(obj => obj.name === "Post") == false) {
            await database.createCollection("Post");
        }
        return database; // you can get from here
    } catch (e) {
        console.log();(e);
    }
};

module.exports = connectDB;