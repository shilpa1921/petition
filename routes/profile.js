const express = require("express");
const router = express.Router();
const {
    requireLogOut,
    requireNoSignature,
    requireSignature,
    requireUserid,
} = require("../middleware");

const { hash, compare } = require("../bc");
const db = require("../db");

router.get("/", requireUserid, (req, res) => {
    res.render("profile");
});

router.post("/", (req, res) => {
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

router.get("/edit", (req, res) => {
    const { userId } = req.session;
    if (userId) {
        db.getusertableinfo(userId)
            .then((result) => {
                console.log("user table row", result);
                return result;
            })
            .then((result) => {
                res.render("edit", {
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

router.post("/edit", (req, res) => {
    console.log("shilpa edit profile");
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
                    if (!req.session.signatureId) {
                        res.redirect("welcime");
                    } else {
                        req.session.signatureId = userId;
                        res.redirect("/thankyou");
                    }
                })

                .catch((err) => {
                    console.log("Error in full update: ", err);

                    db.getusertableinfo(userId)
                        .then((result) => {
                            console.log("user table row", result);
                            return result;
                        })
                        .then((result) => {
                            res.render("edit", {
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
            })
            .then(() => {
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
                        res.render("edit", {
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

module.exports = router;
