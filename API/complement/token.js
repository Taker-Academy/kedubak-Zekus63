const jwt = require("jsonwebtoken");
require('dotenv').config();

function create(User) {

    const jsonData = User;
    const options = {expiresIn: '1h'};
    const token = ((jsonData, options) => {
        try {
            const token = jwt.sign(jsonData, process.env.JWT_KEY, options);
            return token;
        } catch (error) {
            return null;
        }
    })(jsonData, options);
    return token;
}

function verif(req) {
    const tokenH = req.headers.authorization;
    const token = tokenH && tokenH.split(' ')[1];

    if(token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_KEY);

            return {
                code: 200,
                data: decode
            };
        } catch (error) {
            return {
                code: 401
            };
        }
    } else {
        return {
            code: 401
        };
    }
}

module.exports = {create, verif};
