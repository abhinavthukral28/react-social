const { admin, db } = require("./admin");
module.exports = async (request, response, next) => {
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = request.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      request.user = decodedToken;
      const data = await db
        .collection("users")
        .where("userId", "==", request.user.uid)
        .limit(1)
        .get();
      request.user.handle = data.docs[0].data().handle;
      console.log(data.docs);

      return next();
    } catch (err) {
      console.log(err);
      response.status(403).json({ error: err });
    }
  } else {
    return response.status(403).json({ error: "Unauthorized" });
  }
};
