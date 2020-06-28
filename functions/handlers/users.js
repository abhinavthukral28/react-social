const { admin, db } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");
const { validateSignUpData, validateLogin } = require("../util/validators");
firebase.initializeApp(config);
const noImg = "no-img.png";
exports.signUp = async (request, response) => {
  const newUser = { ...request.body };
  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) {
    return response.status(400).json(errors);
  }
  let userRef = null;
  try {
    userRef = await db.collection("users").doc(newUser.handle).get();

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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
  console.log("Got here");

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
exports.uploadImage = async (request, response) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: request.headers });
  let imageToBeUploaded = null;
  let imageFilename = null;

  busboy.on("file", (fieldName, file, filename, encoding, mimetype) => {
    const imageExtension = filename.split(".")[filename.split().length - 1];
    console.log(filename.split(".")[filename.split().length - 1]);

    imageFilename = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFilename);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", async () => {
    try {
      const uploadResponse = await admin
        .storage()
        .bucket(`${config.storageBucket}`)
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype,
            },
          },
        });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
      const doc = await db
        .doc(`/users/${request.user.handle}`)
        .update({ imageUrl });
      return response
        .status(200)
        .json({ message: "Image uploaded successfully" });
    } catch (err) {
      console.log(err);
      return response.status(500).json(err);
    }
  });
  busboy.end(request.rawBody);
};
