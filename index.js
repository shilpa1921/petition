const express = require("express");
const app = express();
const db = require("./db.js");
const handlebars = require("express-handlebars");

const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.static("./public"));

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    console.log("get request to / route succeeded");
    res.redirect("/registration");
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.get("/welcome", (req, res) => {
    const { signatureId } = req.session;
    const { userId } = req.session;

    if (signatureId) {
        res.redirect("/thankyou");
    } else if (userId) {
        res.render("welcome");
    } else {
        res.redirect("/registration");
    }
});

app.post("/welcome", (req, res) => {
    const signature = req.body.signature;
    const user_id = req.session.userId;
    console.log("siganture", signature);

    if (signature != "") {
        db.addName(signature, user_id)
            .then((results) => {
                console.log("issue", results);
                req.session.signatureId = user_id;
                res.redirect("/thankyou");
            })
            .catch((err) => {
                console.log("Error in post welcome ", err);
            });
    } else if (req.statusCode != 200 || signature == "") {
        res.render("welcome", { error: true });
    }
});

app.get("/thankyou", (req, res) => {
    const { signatureId } = req.session;
    const { userId } = req.session;
    let signature1;
    if (signatureId) {
        db.getSig(signatureId)
            .then((result) => {
                console.log("result sig", result);
                signature1 = result;
                return signature1;
            })
            .catch((err) => {
                console.log("Error in countSupports: ", err);
            });
        db.sigTotal()
            .then((results) => {
                let sigTotal = results.rowCount;
                console.log("userid", results.rows[0].user_id);

                console.log("sig total: ", sigTotal);
                // we can also get signature of last user by
                // let len = sigToatl-1;
                // let sig = results.rows[len].signature;

                return sigTotal;
            })
            .then((sigTotal) => {
                console.log("shilpa", signature1);
                res.render("thankyou", {
                    layout: "main",
                    sigTotal,
                    signature1,
                });
            })
            .catch((err) => {
                console.log("err in get thankyou ", err);
                //TO DO: reroute to "/welcome" with error message
            });
    } else {
        res.redirect("/welcome");
    }
});

app.get("/signatories", (req, res) => {
    const { signatureId } = req.session;

    if (signatureId) {
        console.log("Errorrrrrrrrrrr", signatureId);
        db.getNames()
            .then((results) => {
                let list = [];

                for (let i = 0; i < results.length; i++) {
                    let item = results[i];
                    list.push({
                        first: ` ${item.first_name}`,
                        last: `  ${item.last_name} `,
                        age: ` ${item.age}`,
                        city: `${item.city}`,
                        url: ` ${item.url} `,
                    });
                }
                console.log("list: ", list);
                return list;
            })
            .then((list) => {
                res.render("signatories", {
                    layout: "main",
                    signed: list,
                });
            })
            .catch((err) => {
                console.log("err in get signatories", err);
            });
    } else {
        res.redirect("/welcome");
    }
});
app.get("/signatories/:city", (req, res) => {
    const { signatureId } = req.session;
    // if a cookie is set, render
    if (signatureId) {
        const city = req.params.city;
        db.byCityName(city)
            .then((result) => {
                console.log("city names", result);
                res.render("city", { city: city, names: result });
            })
            .catch((err) => {
                console.log("Error in city wise signed: ", err);
            });
    } else {
        res.redirect("/registration");
    }
});

app.post("/registration", (req, res) => {
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
app.get("/profile", (req, res) => {
    // const { userId } = req.session;
    // if (userId) {
    //     res.redirect("/welcome");
    // } else {
    res.render("profile");
    // }
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city;
    let url = req.body.url;
    let user_id = req.session.userId;
    if (url.startsWith("http") || url == "") {
        db.adduserinfo(age, city, url, user_id)
            .then(() => {
                console.log("sucsessfull inserted");
            })
            .catch((err) => {
                console.log("error in inserting user info", err);
            });
        res.redirect("/welcome");
    } else {
        console.log("Bad url", url);
        res.render("profile", {
            error4: true,
        });
    }
});

app.get("/login", (req, res) => {
    // const { userId } = req.session;
    // if (userId) {
    //     res.redirect("/welcome");
    // } else {
    res.render("login");
    // }
});

app.post("/login", (req, res) => {
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
            console.log("Error in checkLogin: ", err);
            res.render("login", { error3: true });
        });
});

app.get("/editprofile", (req, res) => {
    const { userId } = req.session;
    if (userId) {
        db.getusertableinfo(userId)
            .then((result) => {
                console.log("user table row", result);
                return result;
            })
            .then((result) => {
                res.render("editprofile", {
                    first_name: result[0].first_name,
                    last_name: result[0].first_name,
                    email: result[0].email,
                    age: result[0].age,
                    city: result[0].city,
                    url: result[0].url,
                });
            });
    } else {
        res.redirect("/registration");
    }
});

app.post("/editprofile", (req, res) => {
    let {
        first_name,
        last_name,
        email_add,
        password,
        age,
        city,
        url,
    } = req.body;
    const { userId } = req.session;

    if (password != "") {
        hash(password).then((hashedPw) => {
            Promise.all([
                db.updatewithpw(
                    first_name,
                    last_name,
                    email_add,
                    hashedPw,
                    userId
                ),
                db.upsertProfile(age, city, url, userId),
            ])
                .then(() => {
                    req.session.signatureId = userId;
                    res.redirect("/thankyou");
                })
                .catch((err) => {
                    console.log("Error in full update: ", err);

                    db.getusertableinfo(userId)
                        .then((result) => {
                            console.log("user table row", result);
                            return result;
                        })
                        .then((result) => {
                            res.render("editprofile", {
                                first_name: result[0].first_name,
                                last_name: result[0].first_name,
                                email: result[0].email,
                                age: result[0].age,
                                city: result[0].city,
                                url: result[0].url,
                            });
                        })
                        .catch((err) => {
                            console.log("Error in re-rendering /thanks: ", err);
                        });
                });
        });
    } else {
        Promise.all([
            db.updatewithoutpw(first_name, last_name, email_add, userId),
            db.upsertProfile(age, city, url, userId),
        ])
            .then(() => {
                req.session.signatureId = userId;
                res.redirect("/thankyou");
            })
            .catch((err) => {
                console.log("Error in partial update: ", err);

                db.getusertableinfo(userId)
                    .then((result) => {
                        console.log("user table row", result);
                        return result;
                    })
                    .then((result) => {
                        res.render("editprofile", {
                            first_name: result[0].first_name,
                            last_name: result[0].first_name,
                            email: result[0].email,
                            age: result[0].age,
                            city: result[0].city,
                            url: result[0].url,
                        });
                    })
                    .catch((err) => {
                        console.log("Error : ", err);
                    });
            });
    }
});

// app.post("/thankyou/delete", (req, res) => {
//     const { userId } = req.session;
//     const { signatureId } = req.session;
//     console.log("shilpaaaaaaaaaa");

//     db.deleteSignature(userId)
//         .then((res) => {
//             // delete signature ID cookie
//             console.log("deleting user -id", userId);

//             console.log("SUCESSFULLY DELETED");
//             res.signatureId = userId;
//             res.render("welcome");

//             // delete res.rows[0].user_id;
//         })
//         .catch((err) => {
//             console.log("Error in delete Signature: ", err);
//         });
// });
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});
app.listen(process.env.PORT || 8080, () => {
    console.log("my petition server is running");
});
