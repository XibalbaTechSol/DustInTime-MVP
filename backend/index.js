const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize the GoogleGenAI with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- AUTHENTICATION ---

/**
 * Middleware to verify JWT token.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized.' });
    }
    req.userId = decoded.id;
    next();
  });
};

/**
 * Registers a new user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  await db.read();
  const existingUser = db.data.users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  };

  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: 86400, // 24 hours
  });

  res.status(201).send({ auth: true, token });
});

/**
 * Logs in a user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  await db.read();
  const user = db.data.users.find(user => user.email === email);
  if (!user) {
    return res.status(404).send('User not found.');
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) {
    return res.status(401).send({ auth: false, token: null });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: 86400, // 24 hours
  });

  res.status(200).send({ auth: true, token });
});

/**
 * A protected route that requires a valid token.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).send({ message: 'This is a protected route.' });
});


// --- API ROUTES ---

/**
 * Gets all cleaners.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/api/cleaners', async (req, res) => {
  await db.read();
  res.json(db.data.cleaners);
});

/**
 * Gets a single cleaner by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/api/cleaners/:id', async (req, res) => {
    await db.read();
    const cleaner = db.data.cleaners.find(c => c.id === parseInt(req.params.id));
    if (cleaner) {
        res.json(cleaner);
    } else {
        res.status(404).send('Cleaner not found');
    }
});

/**
 * Gets all bookings.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/api/bookings', verifyToken, async (req, res) => {
    await db.read();
    // In a real app, you'd filter bookings by req.userId
    res.json(db.data.bookings);
});

/**
 * Creates a new booking.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.post('/api/bookings', verifyToken, async (req, res) => {
    const newBooking = {
        id: Date.now().toString(),
        ...req.body
    };
    db.data.bookings.push(newBooking);
    await db.write();
    res.status(201).json(newBooking);
});

/**
 * Updates a booking by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.put('/api/bookings/:id', verifyToken, async (req, res) => {
    await db.read();
    const bookingIndex = db.data.bookings.findIndex(b => b.id === req.params.id);
    if (bookingIndex > -1) {
        db.data.bookings[bookingIndex] = { ...db.data.bookings[bookingIndex], ...req.body };
        await db.write();
        res.json(db.data.bookings[bookingIndex]);
    } else {
        res.status(404).send('Booking not found');
    }
});

/**
 * The root route.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

/**
 * Generates a task list using the Google GenAI API.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        listName: {
          type: Type.STRING,
          description: 'A concise and relevant name for the cleaning task list, under 30 characters.'
        },
        tasks: {
          type: Type.ARRAY,
          description: 'An array of tasks to be completed for the cleaning request.',
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The description of a single cleaning task.'
              }
            },
            required: ['text']
          }
        }
      },
      required: ['listName', 'tasks']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a detailed, actionable cleaning checklist based on the following user request: "${prompt}". Provide a short name for the list and a set of distinct tasks.`,
      config: {
        systemInstruction: "You are an assistant that creates structured cleaning checklists. Always adhere to the provided JSON schema.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const generatedData = JSON.parse(jsonString);

    if (!generatedData.listName || !Array.isArray(generatedData.tasks)) {
      throw new Error("Invalid response format from AI.");
    }

    res.json(generatedData);

  } catch (error) {
    console.error('Error generating task list:', error);
    res.status(500).json({ error: 'Sorry, an error occurred while generating the list. The AI might be busy. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
