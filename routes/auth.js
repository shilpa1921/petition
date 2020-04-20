const { app } = require("../index");
const {
    requireLogOut,
    requireNoSignature,
    requireSignature,
    requireUserid,
} = require("../middleware");
const { hash, compare } = require("../bc");
const db = require("../db");

app.get("/registration", requireLogOut, (req, res) => {
    res.render("registration");
});

app.post("/registration", requireLogOut, (req, res) => {
    // we will grab the user input, hash what they provided as a password, and store this information in the database

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var emailadd = req.body.email_add;
    var password = req.body.password;
    var pass;
    // instead of passing the hard coded passwordMagic, you will want to grab what the user provided as potential PW
    // console.log("email", emailadd);
    if (emailadd == "") {
        res.render("registration", {
            error2: true,
        });
    } else if (
        (first_name != "" && last_name != "" && emailadd != "", password != "")
    ) {
        hash(password)
            .then((hashedPw) => {
                console.log("HashedPW in /register", hashedPw);
                pass = hashedPw;
                return pass;
                // once the user info is stored in the database you will want to store the user id in the cookie
            })
            .then((pass) => {
                console.log("hashed password", pass);

                db.addData(first_name, last_name, emailadd, pass)
                    .then((results) => {
                        req.session.userId = results.rows[0].id;
                        console.log("userid", req.session.userId);
                        res.redirect("/profile");
                    })
                    .catch((err) => {
                        res.render("registration", {
                            error2: true,
                        });
                        console.log("Error in post registration ", err);
                    });
            });
    } else {
        res.render("registration", {
            error1: true,
        });
    }
});

app.get("/login", requireLogOut, (req, res) => {
    // const { userId } = req.session;
    // if (userId) {
    //     res.redirect("/welcome");
    // } else {
    res.render("login");
    // }
});

app.post("/login", requireLogOut, (req, res) => {
    // in our login we will want to use compare!
    // we will take the users provided password and compare it to what we have stored as a hash in our db
    let email = req.body.email_add;
    let password = req.body.password;
    let dbpass;
    let id;
    let sessionid;

    // you will go grab the user's stored hash from the db and use that as compare value identifying the user's hash via the email provided by the user trying to log in

    db.getpass(email)
        .then((result) => {
            // console.log("password", result);
            dbpass = result.rows[0].password;
            id = result.rows[0].id;
            return dbpass;
            console.log("dbpassword", dbpass);
        })
        .then((dbpass) => {
            return compare(password, dbpass);
        })
        .then((match) => {
            console.log("match", match);
            if (match) {
                req.session.userId = id;

                sessionid = req.session.userId;
                console.log("after match", sessionid);
                db.checkSign(sessionid).then((results) => {
                    let count = results.rowCount;
                    console.log("count", count);
                    if (count == 0) {
                        res.redirect("/welcome");
                    } else {
                        req.session.signatureId = sessionid;
                        res.redirect("/thankyou");
                    }
                });
            } else {
                res.render("login", { error3: true });
            }
        })
        .catch((err) => {
            res.render("login", { error3: true });
        });
});
