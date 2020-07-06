const functions = require("firebase-functions");
const express = require("express");
const { getAllScreams, createOneScream } = require("./handlers/screams");
const { signUp, login, uploadImage } = require("./handlers/users");
const FBAuth = require("./util/fbAuth");
const app = express();

//Scream Routes
app.get("/screams", getAllScreams);
app.post("/screams", FBAuth, createOneScream);

//User Routes
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user", FBAuth, addUserDetails);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.region("asia-east2").https.onRequest(app);
