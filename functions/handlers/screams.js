const { db } = require("../util/admin");

exports.getAllScreams = async (req, res) => {
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
};

exports.createOneScream = async (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.user.handle,
    createdAt: new Date().toISOString(),
  };
  try {
    const doc = await db.collection("screams").add(newScream);
    response.status(200).json({ message: `document ${doc.id} created` });
  } catch (err) {
    response.status(500).json({ error: "Something went wrong" });
  }
};
