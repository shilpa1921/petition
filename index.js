const express = require("express");
const app = express();
exports.app = app;

const db = require("./db.js");
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const csurf = require("csurf");
const profileRouter = require("./routes/profile");

const {
    requireLogOut,
    requireNoSignature,
    requireSignature,
    requireUserid,
} = require("./middleware");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use((req, res, next) => {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (
        !req.session.userId &&
        req.url != "/registration" &&
        req.url != "/login"
    ) {
        res.redirect("/registration");
    } else {
        next();
    }
});

app.get("/", (req, res) => {
    res.redirect("/registration");
});

require("./routes/auth");

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

app.post("/welcome", requireNoSignature, (req, res) => {
    const signature = req.body.signature;
    const user_id = req.session.userId;
    console.log("siganture for issue", signature);

    if (signature != "") {
        db.addName(signature, user_id)
            .then((results) => {
                console.log("issue", results);

                req.session.signatureId = req.session.userId;

                console.log("user for id   issue", user_id);

                console.log(
                    "siganture for id   issue",
                    req.session.signatureId
                );
                res.redirect("/thankyou");
            })
            .catch((err) => {
                console.log("Error in post welcome ", err);
            });
    } else if (req.statusCode != 200 || signature == "") {
        res.render("welcome", { error: true });
    }
});
app.use("/profile", profileRouter);

app.get("/thankyou", requireSignature, (req, res) => {
    const { signatureId } = req.session;
    const { userId } = req.session;
    console.log("signatureid sig", signatureId);
    console.log("userId sig", userId);
    let signature1;

    db.getSig(signatureId)
        .then((result) => {
            console.log("result sig", result);
            signature1 = result;
            return signature1;
        })
        .then((signature1) => {
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
        });
});

app.get("/signatories", (req, res) => {
    const { signatureId } = req.session;

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
});
app.get("/signatories/:city", requireSignature, (req, res) => {
    const { signatureId } = req.session;
    // if a cookie is set, render

    const city = req.params.city;
    db.byCityName(city)
        .then((result) => {
            console.log("city names", result);
            res.render("city", { city: city, names: result });
        })
        .catch((err) => {
            console.log("Error in city wise signed: ", err);
        });
});

app.post("/thankyou/delete", requireSignature, (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(() => {
            delete req.session.signatureId;
            console.log("Signature id after delete", req.session.signatureId);
            res.redirect("/welcome");
        })
        .catch((err) => {
            console.log("Error in delete Signature: ", err);
        });
});
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8081, () => {
        console.log("my petition server is running");
    });
}
