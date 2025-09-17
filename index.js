const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Update slot status
app.post("/updateSlot", async (req, res) => {
  try {
    const { sensor_id, status } = req.body;

    if (!sensor_id || !status) {
      return res.status(400).json({ error: "Missing required fields: sensor_id or status" });
    }

    // Normalize: anything not "occupied" will be "empty"
    const normalizedStatus = status.toLowerCase() === "occupied" ? "occupied" : "empty";

    const docRef = db.collection("sensor_data").doc(sensor_id);

    await docRef.set(
      {
        status: normalizedStatus,
        lastChanged: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    res.json({ message: `✅ Sensor ${sensor_id} updated`, status: normalizedStatus });
  } catch (error) {
    console.error("❌ Error storing data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
