const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); //need to create new petition database - replace actors with new name

module.exports.getNames = () => {
    return db
        .query(`SELECT user_id FROM signatures`)
        .then((results) => {
            return results.rows;
        })
        .catch((err) => {
            console.log("err", err);
        });
};

module.exports.addName = (signature, user_id) => {
    return db.query(
        `
    INSERT INTO signatures (signature, user_id)
    VALUES($1, $2) RETURNING id`,
        [signature, user_id]
    );
};

module.exports.addData = (first_name, last_name, emailadd, password) => {
    return db.query(
        `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, emailadd, password]
    );
};

module.exports.sigTotal = () => {
    return db
        .query(`SELECT * FROM signatures`)
        .then((results) => {
            return results;
        })
        .catch((err) => {
            console.log("err", err);
        });
};

module.exports.getSig = (signatureId) => {
    return db
        .query(`SELECT signature FROM signatures WHERE id = ${signatureId} `)
        .then((results) => {
            return results.rows[0].signature;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};

module.exports.checkSign = (sessionid) => {
    return db
        .query(`SELECT user_id FROM signatures WHERE user_id = ${sessionid} `)
        .then((results) => {
            return results;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};

module.exports.getpass = (email) => {
    return db
        .query(`SELECT * FROM users WHERE email = '${email}';`)
        .then((results) => {
            return results;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};
