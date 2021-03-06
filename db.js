const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
); //need to create new petition database - replace actors with new name

const input = require("./input");
module.exports.getNames = () => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name, user_profiles.age As age, user_profiles.city As city ,user_profiles.url As url FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON signatures.user_id = user_profiles.user_id `
        )
        .then((results) => {
            return results.rows;
        })
        .catch((err) => {
            console.log("err111", err);
        });
};
module.exports.byCityName = (city) => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name, user_profiles.age As age, user_profiles.url As url FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON signatures.user_id = user_profiles.user_id WHERE LOWER(user_profiles.city) = LOWER($1);  `,
            [city]
        )
        .then((results) => {
            return results.rows;
        })
        .catch((err) => {
            console.log("err111", err);
        });
};
module.exports.addData = (first_name, last_name, emailadd, password) => {
    return db.query(
        `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, emailadd, password]
    );
};

module.exports.addName = (signature, user_id) => {
    return db.query(
        `
    INSERT INTO signatures (signature, user_id)
    VALUES($1, $2) RETURNING id`,
        [signature, user_id]
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
        .query(`SELECT signature FROM signatures WHERE user_id = $1; `, [
            signatureId,
        ])
        .then((results) => {
            return results.rows[0].signature;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};

module.exports.checkSign = (sessionid) => {
    return db
        .query(`SELECT user_id FROM signatures WHERE user_id =$1 `, [sessionid])
        .then((results) => {
            return results;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};

module.exports.deleteSignature = (userId) => {
    return db
        .query(`DELETE FROM signatures WHERE user_id = $1;`, [userId])
        .then(() => {
            console.log("SUCESSFULLY DELETED");
        })
        .catch((err) => {
            console.log("error in deleting signature", err);
        });
};

module.exports.getpass = (email) => {
    return db
        .query(`SELECT * FROM users WHERE email = $1;`, [email])
        .then((results) => {
            return results;
        })
        .catch((err) => {
            console.log("errrrrrrr", err);
        });
};

module.exports.getusertableinfo = (userId) => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name, users.email AS email, user_profiles.age As age, user_profiles.city As city ,user_profiles.url As url FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1 `,
            [userId]
        )
        .then((results) => {
            console.log("db query", results.rows);
            return results.rows;
        })
        .catch((err) => {
            console.log("err in get user table info", err);
        });
};

module.exports.adduserinfo = (age, city, url, user_id) => {
    return db.query(
        `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES($1, $2, $3, $4) `,
        [input.checkAge(age), city, input.checkUrl(url), user_id]
    );
};
module.exports.updatewithpw = (first_name, last_name, email, password, id) => {
    return db.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5;`,
        [first_name, last_name, email, password, id]
    );
};
module.exports.updatewithoutpw = (first_name, last_name, email_add, userId) => {
    return db.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4;`,
        [first_name, last_name, email_add, userId]
    );
};

module.exports.upsertProfile = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3;`,
        [input.checkAge(age), city, input.checkUrl(url), userId]
    );
};
