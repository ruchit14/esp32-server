// POST /data
app.post('/data', async (req, res) => {
  try {
    const { sensor_name, sensor_id, status } = req.body;

    // Validate request
    if (!sensor_name || !sensor_id || !status) {
      return res.status(400).send('Missing required fields: sensor_name, sensor_id, or status');
    }

    // Normalize status (only "empty" or "full")
    const normalizedStatus = status.toLowerCase() === 'full' ? 'full' : 'empty';

    const data = {
      sensor_name,
      sensor_id,
      status: normalizedStatus,
      lastChanged: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('sensor_data').add(data);

    res.status(200).send(`Sensor data stored with ID: ${docRef.id}`);
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});
