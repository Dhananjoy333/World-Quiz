import {useState,useEffect,useRef} from 'react'
import axios from "axios";
import "./guessCapital.css"
import background from "../assets/mainPage/bg_capital.png"
import correctSound from "../assets/sounds/correct.mp3"
import wrongSound from "../assets/sounds/error.mp3"
import music from "../assets/sounds/lofi1.mp3"
import { useUser } from '@clerk/react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const GuessCapital = () => {
  //audios
  const correctAudio = useRef(new Audio(correctSound))
  const wrongAudio = useRef(new Audio(wrongSound))
  const bgmusic = useRef(new Audio(music))
  const { user } = useUser()

  //setting states for score, countryName and correctCapital just for checking
    const [highestScore, setHighestScore] = useState(0)
    const [score,setScore] = useState(0)
    const [CorrectAns,setCorrectAns] = useState(0)
    const [WrongAns,setWrongAns] = useState(0)
    const [streak, setStreak] = useState(0)
    const [multiplier, setMultiplier] = useState(1)
    const [countryName,setCountryName] = useState("")
    const [correctCapital,setCorrectCapital] = useState("")
    const [userCapital,setUserCapital] = useState("")
    const [answerStatus, setAnswerStatus] = useState(null)
    const [revealedLetters, setRevealedLetters] = useState(0)
    const [hintDisplay, setHintDisplay] = useState("")
    const [isMusicOn, setIsMusicOn] = useState(true)

  // Fetch question from backend using Axios
  async function fetchNewQuestion(){
    try{
      const response = await axios.get(`${API_BASE_URL}/question`)
      setCountryName(response.data.name?.trim())
      setCorrectCapital(response.data.capital)
      console.log(response.data.capital)
    }
    catch(err){
      console.error("Error fetching question:",err)
    }
  }
  
  //fetch high score of user
  useEffect(() => {
  if(user){
    axios
      .get(`${API_BASE_URL}/highscore/capital/${user.id}`)
      .then((res) => {
        setHighestScore(res.data.highScore)
      })
      .catch((err) => console.log(err))
    }
  }, [user])
  //run once when website load
  useEffect(() => {
    fetchNewQuestion()
  },[]);

  useEffect(() => {
    bgmusic.current.loop = true
    bgmusic.current.volume = 0.3
    bgmusic.current.play()

    return () => {
      bgmusic.current.pause()
    }
  }, [])

  //show hints
  function handleHint() {
    if (!correctCapital) return
    if (revealedLetters >= correctCapital.length) return

    const newReveal = revealedLetters + 1
    setRevealedLetters(newReveal)

    const hint = correctCapital
      .split("")
      .map((letter, index) => index < newReveal ? letter : "_")
      .join(" ")

    setHintDisplay(hint)
  }

  function startMusic(){
    if(isMusicOn && bgmusic.current.paused){
      bgmusic.current.play().catch(()=>{})
    }
  }
  //handle capital name submission
  async function handleSubmit(event){
    event.preventDefault(); //prevent default reload

    let newStreak = streak
    let tempScore = score
    startMusic()
    if(userCapital.trim().toLowerCase() == correctCapital.trim().toLowerCase()){
      setCorrectAns((prevScore)=> prevScore + 1);

      newStreak = streak + 1
      setStreak(newStreak);
      
      let newMultiplier = 1
      if (newStreak >= 10) newMultiplier = 5
      else if (newStreak >= 5) newMultiplier = 3
      else if (newStreak >= 3) newMultiplier = 2
      else if (newStreak >= 2) newMultiplier = 1.5

      setMultiplier(newMultiplier)

      tempScore += Math.floor(100 * newMultiplier) 
      setAnswerStatus("correct")
      correctAudio.current.currentTime = 0
      correctAudio.current.play()
    }else{
      setWrongAns((prevScore)=> prevScore + 1);
      setStreak(0)
      setMultiplier(1)
      tempScore = tempScore - 100
      setAnswerStatus("wrong")
      wrongAudio.current.currentTime = 0
      wrongAudio.current.play()
    }
    setScore(tempScore)

    //if score earned in session is higher than highestScore store in db
    if(tempScore > highestScore){
        await axios.post(`${API_BASE_URL}/save-score`, {
          clerkId: user.id,
          gameMode: "capital",
          score: tempScore
        })
        setHighestScore(prev => Math.max(prev, tempScore))
    }
    setTimeout(() => {
      setRevealedLetters(0)
      setHintDisplay("")
      setUserCapital(""); // Clear input after submission
      fetchNewQuestion(); // Get new Question
    }, 1000); // Delay before fetching new question to show feedback
  }

  function toggleMusic(){
    if(isMusicOn){
      bgmusic.current.pause()
    }else{
      bgmusic.current.play()
    }

    setIsMusicOn(!isMusicOn)
  }
    
  return (
  <div className="guess-country">
  <img src={background} className="bg_img" />
  <div className="music-toggle" onClick={toggleMusic}>
    {isMusicOn ? "🔊" : "🔇"}
  </div>
  {/* Hint Panel */}
  {hintDisplay && (
    <div className="hint-panel">
      <span>💡 HINT:</span> {hintDisplay}
    </div>
  )}
    <div className="ui-panel">
      {/* top score board */}
      <div className="top-score">
        <div className="highest">
          <p>HIGHEST SCORE</p>
          <h1>{highestScore}</h1>
        </div>

        <div className="answer-status">
          {answerStatus === "correct" && (
            <span className="correct">CORRECT</span>
          )}

          {answerStatus === "wrong" && (
            <span className="wrong">WRONG</span>
          )}
        </div>

        <div className="current">
          <p>CURRENT SCORE</p>
          <h1>{score}</h1>
        </div>
      </div>

    {/* main area */}
      <div className="center-game">
        <h1 className="country-name">{countryName}</h1>
        <input
          type="text"
          className="capital-input"
          placeholder="ENTER CAPITAL"
          value={userCapital}
          onChange={(e) => setUserCapital(e.target.value)}     
        />

        <button className="submit-btn" onClick={handleSubmit}>
          SUBMIT
        </button>

      {/* powerUps */}
        <div className="powerups-box">
          <h3>POWERUPS</h3>
          <div className="powerups">
            <div className="powerup">
              <p>{multiplier}X</p>
              <span>Score Multiplier</span>
            </div>

            <div className="powerup" onClick={handleHint}>
              <p>💡</p>
              <span>Hint</span>
            </div>

            <div className="powerup">
              <p>🔥</p>
              <span>Streak : {streak}</span>
            </div>

          </div>
        </div>

      </div>

    </div>
    <div className="score-stats">
      <h3>SCORE STATS</h3>
      <div className="stat-row">
        <span>Correct Answers</span>
        <span className="correct-num">{CorrectAns}</span>
      </div>

      <div className="stat-row">
        <span>Wrong Answers</span>
        <span className="wrong-num">{WrongAns}</span>
      </div>

    </div>
  </div>
  )
}

export default GuessCapital