const { db } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");
const { validateSignUpData, validateLogin } = require("../util/validators");
firebase.initializeApp(config);

exports.signUp = async (request, response) => {
  const newUser = { ...request.body };
  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) {
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
        handle: newUser.handle,
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
};
exports.login = async (request, response) => {
  const user = { ...request.body };
  const { valid, errors } = validateLogin(user);
  if (!valid) {
    return response.status(400).json(errors);
  } else {
    try {
      let login = await firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password);

      const token = await login.user.getIdToken();
      console.log(token);

      return response.status(200).json({ token });
    } catch (err) {
      return response.status(500).json(err);
    }
  }
};
