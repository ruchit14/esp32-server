const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<your-project-id>.firebaseio.com"
});

const db = admin.firestore();

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/data', async (req, res) => {
  try {
    const { sensor_name, sensor_id, status } = req.body;

    if (!sensor_name || !sensor_id || !status) {
      return res.status(400).send('Missing required fields: sensor_name, sensor_id, or status');
    }

    const normalizedStatus = status.toLowerCase() === 'full' ? 'full' : 'empty';

    const data = {
      sensor_name,
      sensor_id,
      status: normalizedStatus,
      lastChanged: admin.firestore.FieldValue.serverTimestamp()
    };
// Use sensor_id as the document ID
const docRef = db.collection('sensor_data').doc(sensor_id);

await docRef.set(data, { merge: true });

res.status(200).send(`Sensor ${sensor_id} data updated successfully`);

  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
