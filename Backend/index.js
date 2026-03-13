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

// Enable CORS for all routes
app.use(cors({origin : "*"}));
app.use(express.json()) 
//database connection
const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for NeonDB
});
db.on("error", (err) => {
  console.error("Unexpected pool error", err);
});

//sending/storing user on db
app.post('/api/create-user',async(req,res)=>{
  const {clerkId, username} = req.body
  try {
    await db.query(
      "INSERT INTO users (clerk_user_id, username) VALUES ($1, $2) ON CONFLICT (clerk_user_id) DO NOTHING",
      [clerkId, username]
    )
    res.json({message: 'User created or already exists'})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Database error'})
  }
})

let capitalQuiz = [];
let flagsQuiz = [];

// Function to fetch data before starting the server
async function loadQuestions() {
  try {
    const res = await db.query("SELECT * FROM countries");
    capitalQuiz = res.rows;

    const flagList = await db.query("SELECT * FROM countries")
    flagsQuiz = flagList.rows;
    console.log("Quiz data loaded successfully!");
  } catch (err) {
    console.error("Error fetching quiz data", err.stack);
  }
}

// Function to get a random question 
let lastIndex = -1;
function nextQuestion(list) {
  if (!list || list.length === 0) 
    return { error: "No questions available" };
  let index;
  do {
    index = Math.floor(Math.random() * list.length);
  } while(index === lastIndex && list.length > 1);
  lastIndex = index;
  return list[index];
}


// API endpoint to send question data for capital quiz
app.get("/api/question", (req, res) => {
  const question = nextQuestion(capitalQuiz);
  res.json(question);
});

// API endpoint to send question data
app.get("/api/flags", (req, res) => {
  const question = nextQuestion(flagsQuiz);
  res.json(question);
});

//saving scores to db
app.post('/api/save-score', async(req,res) => {
  const {clerkId, gameMode, score} = req.body;
  //user not logged in
  if (!clerkId){
    return res.json({
      saved: 'false',
      message: 'user not logged in'
    })
  }
  try {
    const userResult = await db.query(
      "SELECT id FROM users WHERE clerk_user_id = $1",
      [clerkId]
    )
    if (userResult.rows.length === 0){
      return res.json({
        saved : false,
        message: 'user not found'
      })
    }
    const userId = userResult.rows[0].id;
    await db.query(
      "INSERT INTO scores (user_id, game_mode, high_score) VALUES ($1, $2, $3) ON CONFLICT (user_id, game_mode) DO UPDATE SET high_score = GREATEST(scores.high_score, EXCLUDED.high_score)",
      [userId, gameMode, score]
    )
    res.json({saved: true})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Database error"})
  }
})

//one api to get all game mode highscores
app.get("/api/highscore/:mode/:clerkId", async (req, res) => {
  const { mode, clerkId } = req.params;
  try {
    const result = await db.query(
      `SELECT s.high_score
       FROM scores s
       JOIN users u ON s.user_id = u.id
       WHERE u.clerk_user_id = $1
       AND s.game_mode = $2`,
      [clerkId, mode]
    );
    if(result.rows.length === 0){
      return res.json({ highScore: 0 });
    }
    res.json({ highScore: result.rows[0].high_score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//api to calculate the total of all gameModes of users and return top 10 players
app.get("/api/leaderboard", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        SUM(s.high_score) AS total_score
      FROM users u
      JOIN scores s ON s.user_id = u.id
      GROUP BY u.id, u.username
      ORDER BY total_score DESC
      LIMIT 10;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//rendering
app.use(express.static(frontendPath));
app.get("/",async (req,res)=>{
    res.sendFile(path.join(frontendPath, "index.html"));
})

//server listening

loadQuestions().then(()=>{
  app.listen(port,()=>{
    console.log(`Server running at port ${port}`)
  })
})
