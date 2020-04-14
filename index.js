const express = require("express");
const app = express();
const db = require("./db.js");
const handlebars = require("express-handlebars");

const cookieSession = require("cookie-session");

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

    // req.session.msg = "bigSecret99";
    // req.session.permission = true;
    // console.log("session cookie, after value is set: ", req.session);
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    const { signatureId } = req.session;

    if (signatureId) {
        res.redirect("/thankyou");
    } else {
        res.render("welcome");
    }
});

app.post("/welcome", (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const signature = req.body.signature;
    if (first_name != "" && last_name != "" && signature != "") {
        db.addName(first_name, last_name, signature)
            .then((results) => {
                req.session.signatureId = results.rows[0].id;
                res.redirect("/thankyou");
            })
            .catch((err) => {
                console.log("Error in post welcome ", err);
            });
    } else if (
        req.statusCode != 200 ||
        (first_name == "" && last_name == "" && signature == "")
    ) {
        res.render("welcome", { error: true });
    }
});

app.get("/thankyou", (req, res) => {
    const { signatureId } = req.session;
    let signature1;
    if (signatureId) {
        db.getSig(signatureId)
            .then((result) => {
                console.log("result sig", result);
                signature1 = result;
            })
            .catch((err) => {
                console.log("Error in countSupports: ", err);
            });
        db.sigTotal()
            .then((results) => {
                let sigTotal = results.rowCount;

                console.log("sig total: ", sigTotal);
                // we can also get signature of last user by
                // let len = sigToatl-1;
                // let sig = results.rows[len].signature;

                return sigTotal;
            })
            .then((sigTotal) => {
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
        db.getNames()
            .then((results) => {
                let list = [];

                for (let i = 0; i < results.length; i++) {
                    let item = results[i];

                    list.push(
                        ` ${item.id} ${item.first_name} ${item.last_name} `
                    );
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

app.listen(8083, () => console.log("Server running"));
