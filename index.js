const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://atlas-sql-649e6af5983efb57c4db9e1d-3iil6.a.query.mongodb.net/Airbnb_DB?ssl=true&authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Define MongoDB User Schema and Model (User registration info will be stored here)
const userSchema = new mongoose.Schema({
    firstname: { type: String, unique: false, required: true },
    secondname: { type: String, unique: false, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    confirmpassword: { type: String, required: true}
});

const User = mongoose.model('User', userSchema);

// User Registration API Endpoint
app.post('/api/register', async (req, res) => {
    const { firstname, secondname, email, phone, password, confirmpassword } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ firstname, secondname, email, phone, password: hashedPassword, confirmpassword: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Login API Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
  try {
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
