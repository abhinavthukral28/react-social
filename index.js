const firebase = require("firebase");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert(require("./key.json")),
});

var firebaseConfig = {
  apiKey: "AIzaSyAxF3zXl6fuBNw5zvP-1HbakyY03iRhulA",
  authDomain: "react-social-b116f.firebaseapp.com",
  databaseURL: "https://react-social-b116f.firebaseio.com",
  projectId: "react-social-b116f",
  storageBucket: "react-social-b116f.appspot.com",
  messagingSenderId: "662655172456",
  appId: "1:662655172456:web:386390794280b80beea0dd",
  measurementId: "G-J2ZGPKJPY5",
};
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.docs.forEach((doc) => {
        screams.push({ screamId: doc.id, ...doc.data() });
      });

      return res.json(screams);
    })
    .catch((error) => console.log(error));
});

app.post("/screams", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: new Date().toISOString(),
  };
  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created` });
    })
    .catch((error) => {
      response.status(500).json({ error: "Something went wrong" });
    });
});
app.post("/signup", async (request, response) => {
  const token = null;
  const newUser = { ...request.body };
  let userRef = null;
  try {
    userRef = await db.collection("users").doc(newUser.handle).get();

    console.log("This a", userRef.exists);
    if (userRef.exists) {
      return response.status(400).json({ message: "this user already exists" });
    } else {
      const addUserRequest = await firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
      const userCredentials = {
        userId: addUserRequest.user.uid,
        email: addUserRequest.user.email,
        createdAt: new Date().toISOString(),
      };
      const addUser = await db
        .doc(`users/${newUser.handle}`)
        .set(userCredentials);

      return response.status(201).json({
        message: `user ${addUserRequest.user.uid} created successfully`,
      });
    }
  } catch (err) {
    response.status(500).json(err);
  }
});

exports.api = functions.region("asia-east2").https.onRequest(app);
