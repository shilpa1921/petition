const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test("GET /welcome sends a 302 status code for logged-out users and redirects to '/registration'", () => {
    const cookie = {};
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/welcome")
        .then((res) => {
            let redirectText = res.res.text;
            console.log("result", res);
            expect(res.statusCode).toBe(302);
            expect(redirectText).toBe("Found. Redirecting to /registration");
        });
});

test("GET /regisration sends a 302 status code for logged-in users and redirects to '/welcome'", () => {
    const cookie = { userId: 1 };
    console.log("cokkie", cookie);
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/registration")
        .then((res) => {
            let redirectText = res.res.text;
            expect(res.statusCode).toBe(302);
            expect(redirectText).toBe("Found. Redirecting to /welcome");
        });
});

test("GET /thankyou sends a 302 status code for logged-in non-signers and redirects to '/welcome'", () => {
    const cookie = { userId: 1 };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/thankyou")
        .then((res) => {
            let redirectText = res.res.text;
            expect(res.statusCode).toBe(302);
            expect(redirectText).toBe("Found. Redirecting to /welcome");
        });
});

test("POST /welcome sends a 302 status code for logged-in signers and redirects to '/thankyou'", () => {
    const cookie = { userId: 1, signatureId: 1 };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .post("/welcome")
        .then((res) => {
            let redirectText = res.res.text;
            expect(res.statusCode).toBe(302);
            expect(redirectText).toBe("Found. Redirecting to /thankyou");
        });
});
