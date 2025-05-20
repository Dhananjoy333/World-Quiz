import dotenv from "dotenv";
dotenv.config();

import express from "express"
import cors from "cors";
import path,{dirname} from "path";
import {fileURLToPath} from "url"
import pg from "pg"

const app = express()
const port = 3000
const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendPath = path.join(__dirname, "../Frontend/dist");

console.log(__dirname)
console.log(frontendPath)
// Enable CORS for all routes
app.use(cors({origin : "*"}));

//database
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for NeonDB
});

async function connectDB() {
  try {
    await db.connect();
    console.log("✅ Connected to NeonDB database!");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
}

let capitalQuiz = [];
let flagsQuiz = [];

// Function to fetch data before starting the server
async function loadQuestions() {
  try {
    const res = await db.query("SELECT * FROM capitals");
    capitalQuiz = res.rows;

    const flagList = await db.query("SELECT * FROM flags")
    flagsQuiz = flagList.rows;
    console.log("Quiz data loaded successfully!");
  } catch (err) {
    console.error("Error fetching quiz data", err.stack);
  }
}

// Function to get a random question 
function nextQuestion(getQuestion) {
  if (!getQuestion || getQuestion.length === 0) 
    return { error: "No questions available" };
  return getQuestion[Math.floor(Math.random() * getQuestion.length)];
}


// API endpoint to send question data
app.get("/api/question", (req, res) => {
  const question = nextQuestion(capitalQuiz);
  res.json(question);
});

// API endpoint to send question data
app.get("/api/flags", (req, res) => {
  const question = nextQuestion(flagsQuiz);
  res.json(question);
});

//Score Handling
let highScoreOfGuessCapital = 0;
let highScoreOfGuessCountry = 0;
//fetching highscore from database
async function getHighScore() {
  try {
    const res = await db.query("SELECT * FROM public.highest_score WHERE id = 1");
    
    return {
      highScoreOfGuessCapital: res.rows[0].highestscore_guesscapital,
      highScoreOfGuessCountry: res.rows[0].highestscore_guesscountry,
    };
  } catch (err) {
    console.error("Could not connect with score database", err);
    return { highScoreOfGuessCapital: 0,
             highScoreOfGuessCountry: 0 
            }; // Return default values if error occurs
  }
}

// Sending high score data
app.get("/api/highScore", async (req, res) => {
  const scores = await getHighScore(); // Wait for scores before sending
  res.json(scores);
});

app.use(express.json())
//handling i.e, storing highest score to db and also sending it back to frontend for rendering(this is for Guess capital)
app.post("/api/high-score", async (req,res)=>{
  const highestScore = req.body.tempScore
  const currentHighScoreIndb = await getHighScore()
  if(highestScore >  currentHighScoreIndb.highScoreOfGuessCapital){
    await db.query("UPDATE public.highest_score SET highestscore_guesscapital = $1 WHERE id = 1", [highestScore])
    res.json({ message: "New High Score!", highestScore });
  }
}) 

//handling i.e, storing highest score to db and also sending it back to frontend for rendering(this is for Guess country)
app.post("/api/high-score-country", async (req,res)=>{
  const highestScore = req.body.tempScore
  const currentHighScoreIndb = await getHighScore()
  if(highestScore >  currentHighScoreIndb.highScoreOfGuessCountry){
    await db.query("UPDATE public.highest_score SET highestscore_guesscountry = $1 WHERE id = 1", [highestScore])
    res.json({ message: "New High Score!", highestScore });
  }
}) 

//rendering
app.use(express.static(frontendPath));
app.get("/",async (req,res)=>{
    res.sendFile(path.join(frontendPath, "index.html"));
})

//server listening
connectDB().then(()=>{
  loadQuestions().then(()=>{
    app.listen(port,()=>{
      console.log(`Server running at port ${port}`)
    })
  })
})