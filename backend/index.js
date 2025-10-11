const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
const db = require('./db');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize the GoogleGenAI with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
};

// --- API ROUTES ---

// Cleaners
app.get('/api/cleaners', async (req, res) => {
  await db.read();
  res.json(db.data.cleaners);
});

app.get('/api/cleaners/:id', async (req, res) => {
    await db.read();
    const cleaner = db.data.cleaners.find(c => c.id === parseInt(req.params.id));
    if (cleaner) {
        res.json(cleaner);
    } else {
        res.status(404).send('Cleaner not found');
    }
});

// Bookings
app.get('/api/bookings', verifyToken, async (req, res) => {
    await db.read();
    // In a real app, you'd filter bookings by req.userId
    res.json(db.data.bookings);
});

app.post('/api/bookings', verifyToken, async (req, res) => {
    const newBooking = {
        id: Date.now().toString(),
        ...req.body
    };
    db.data.bookings.push(newBooking);
    await db.write();
    res.status(201).json(newBooking);
});

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


app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

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
