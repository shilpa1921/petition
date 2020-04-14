const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); //need to create new petition database - replace actors with new name

module.exports.getNames = () => {
    return db
        .query(`SELECT first_name, last_name, id FROM signatures`)
        .then((results) => {
            return results.rows;
        })
        .catch((err) => {
            console.log("err", err);
        });
};

module.exports.addName = (first_name, last_name, signature) => {
    return db.query(
        `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES($1, $2, $3) RETURNING id`,
        [first_name, last_name, signature]
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
