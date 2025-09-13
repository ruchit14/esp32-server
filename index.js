const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// POST /data
app.post('/data', async (req, res) => {
  try {
    const { id, name, status } = req.body;

    if (!id || !name || !status) {
      return res.status(400).send('Missing required fields: id, name, or status');
    }

    const data = {
      id: id,
      name: name,
      status: status.toLowerCase() === 'occupied' ? 'occupied' : 'empty',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('sensor_data').add(data);

    res.status(200).send(`Sensor data stored with ID: ${docRef.id}`);
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
