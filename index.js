const express = require("express");
const app = express();
const db = require("./db.js");
const handlebars = require("express-handlebars");
const cookieParser = require("cookie-parser");

app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.static("./public"));

app.use(cookieParser());

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    console.log("get request to / route succeeded");
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    // if (!req.cookies.agreed) {
    res.render("welcome");
    //     } else {
    //         res.redirect("/thankyou");
    //     }
});

app.post("/welcome", (req, res) => {
    //capture inputs
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const signature = req.body.signature;
    if (first_name != "" && last_name != "" && signature != "") {
        // insert the data as values in my signatures table
        db.addName(first_name, last_name, signature)
            .then(() => {
                console.log("That worked!");
            })
            .catch((err) => {
                console.log("Error in post welcome ", err);
            });
        // set cookie & redirect
        res.cookie("agreed", true);
        res.redirect("/thankyou");
    } else if (
        // there is either an error or
        req.statusCode != 200 ||
        // the values are empty
        (first_name == "" && last_name == "" && signature == "")
    ) {
        // render the petition template with error helper
        res.render("welcome", { error: true });
    }
});

app.get("/thankyou", (req, res) => {
    if (!req.cookies.agreed) {
        res.redirect("/welcome");
    } else {
        db.sigTotal()
            .then((results) => {
                let sigTotal = results;
                console.log("sig total: ", sigTotal);
                return sigTotal;
            })
            .then((sigTotal) => {
                res.render("thankyou", {
                    layout: "main",
                    sigTotal: sigTotal,
                });
            })
            .catch((err) => {
                console.log("err in get thankyou ", err);
                //TO DO: reroute to "/welcome" with error message
            });
    }
});

app.get("/signatories", (req, res) => {
    if (!req.cookies.agreed) {
        res.redirect("/welcome");
    } else {
        db.getNames()
            .then((results) => {
                let list = [];

                for (let i = 0; i < results.length; i++) {
                    let item = results[i];

                    list.push(` ${item.first_name} ${item.last_name}`);
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
    }
});

app.listen(8080, () => console.log("Server running"));
