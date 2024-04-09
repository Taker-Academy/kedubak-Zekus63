var bcrypt = require('bcrypt');
require('dotenv').config();

async function create(password) {
    return bcrypt
        .hash(password, 10)
        .then(hash => {
            return hash;
        })
        .catch(err => {
            return false
        })
}

async function verif(Cpassword, Mpassword) {
    return bcrypt
        .compare(Cpassword, Mpassword)
        .then(res => {
            if (res) {
                return true;
            } else {
                return false;
            }
        })
        .catch(err => {
            return false;
        })
}

module.exports = {create, verif};
