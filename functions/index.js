const functions = require("firebase-functions");
const express = require("express");
const { getAllScreams, createOneScream } = require("./handlers/screams");
const { signUp, login } = require("./handlers/users");
const FBAuth = require("./util/fbAuth");
const app = express();

app.get("/screams", getAllScreams);
app.post("/screams", FBAuth, createOneScream);
app.post("/signup", signUp);
app.post("/login", login);

exports.api = functions.region("asia-east2").https.onRequest(app);
