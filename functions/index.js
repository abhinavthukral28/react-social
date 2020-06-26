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
app.get("/screams", async (req, res) => {
  try {
    const data = await db
      .collection("screams")
      .orderBy("createdAt", "desc")
      .get();
    let screams = [];
    data.docs.forEach((doc) => {
      screams.push({ screamId: doc.id, ...doc.data() });
    });
    return res.status(200).json(screams);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/screams", async (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: new Date().toISOString(),
  };
  try {
    const doc = await db.collection("screams").add(newScream);
    response.status(200).json({ message: `document ${doc.id} created` });
  } catch (err) {
    response.status(500).json({ error: "Something went wrong" });
  }
});
const isEmpty = (string) => {
  return string.trim() === "" ? true : false;
};
const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx);
};
app.post("/signup", async (request, response) => {
  let errors = {};
  const newUser = { ...request.body };
  if (isEmpty(newUser.email)) {
    errors.email = "Email is empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Not a valid email";
  }
  if (isEmpty(newUser.password)) {
    errors.password = "Password is empty";
  } else if (newUser.password !== newUser.confirmedPassword) {
    errors.confirmPassword = "passwords do not match";
  }
  if (isEmpty(newUser.handle)) {
    errors.handle = "Handle is empty";
  }
  if (Object.keys(errors).length > 0) {
    return response.status(400).json(errors);
  }
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
      const token = await addUserRequest.user.getIdToken();

      return response.status(201).json({
        token: token,
      });
    }
  } catch (err) {
    response.status(500).json(err);
  }
});

app.post("/login", async (request, response) => {
  let errors = {};
  const user = { ...request.body };
  if (isEmpty(user.email)) errors.email = "Email cannot be empty";
  else if (!isEmail(user.email)) errors.email = "Invalid Email";
  if (isEmpty(user.password)) errors.password = "Password cannot be empty";
  if (Object.keys(errors).length > 0) return response.status(400).json(errors);
  else {
    try {
      let login = await firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password);

      const token = await login.user.getIdToken();

      return response.status(200).json({ token });
    } catch (err) {
      return response.status(500).json(err);
    }
  }
});

exports.api = functions.region("asia-east2").https.onRequest(app);
