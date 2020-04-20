function requireSignature(req, res, next) {
    if (!req.session.signatureId) {
        res.redirect("/welcome");
    } else {
        next();
    }
}

function requireUserid(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/registration");
    } else {
        next();
    }
}

function requireNoSignature(req, res, next) {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
    } else {
        next();
    }
}

function requireLogOut(req, res, next) {
    if (req.session.userId) {
        res.redirect("/welcome");
    } else {
        next();
    }
}

exports.requireLogOut = requireLogOut;
exports.requireNoSignature = requireNoSignature;
exports.requireSignature = requireSignature;
exports.requireUserid = requireUserid;
