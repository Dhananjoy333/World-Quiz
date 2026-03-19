import {useState,useEffect,useRef} from 'react'
import axios from 'axios'
import "./guessCountry.css"
import background from "../assets/mainPage/bg_country.avif"
import correctSound from "../assets/sounds/correct.mp3"
import wrongSound from "../assets/sounds/error.mp3"
import music from "../assets/sounds/lofi1.mp3"
import { useUser } from '@clerk/react'

const API_BASE_URL = import.meta.env.VITE_API_URL;

const GuessCountry = () => {
  //audios
    const correctAudio = useRef(new Audio(correctSound))
    const wrongAudio = useRef(new Audio(wrongSound))
    const bgmusic = useRef(new Audio(music))
    const { user } = useUser()

    const [highestScore, setHighestScore] = useState(0)
    const [score,setScore] = useState(0)
    const [CorrectAns,setCorrectAns] = useState(0)
    const [WrongAns,setWrongAns] = useState(0)
    const [flag, setFlag] = useState("")
    const [userInput, setUserInput] = useState("") //will use to check with actual ans
    const [correctCountry, setCorrectCountry] = useState("")
    const [answerStatus, setAnswerStatus] = useState(null)
    const [streak, setStreak] = useState(0)
    const [multiplier, setMultiplier] = useState(1)
    const [isMusicOn, setIsMusicOn] = useState(true)

    //fetching data from backend
    async function getQuestion(){
      try {
        const response = await axios.get(`${API_BASE_URL}/flags`)
        setFlag(response.data.code.toLowerCase())
        setCorrectCountry(response.data.name)   //will use to check with userinput
      } catch (error) {
        console.error("Couldn't fetch Question: ",error)
      }
    }
  //run once on load
  useEffect(() =>{
    getQuestion()},[]
  )
  useEffect(() => {
    bgmusic.current.loop = true
    bgmusic.current.volume = 0.3
    bgmusic.current.play()

    return () => {
      bgmusic.current.pause()
    }
  }, [])
  
  //fetch high score of user
  useEffect(() => {
  if(user){
    axios
      .get(`${API_BASE_URL}/highscore/country/${user.id}`)
      .then((res) => {
        setHighestScore(res.data.highScore)
      })
      .catch((err) => console.log(err))
    }
  }, [user])

  function startMusic(){
    if(isMusicOn && bgmusic.current.paused){
      bgmusic.current.play().catch(()=>{})
    }
  }

  async function handleSubmit(event){
    event.preventDefault();

    let newStreak = streak
    let tempScore = score
    startMusic()
    if(userInput.trim().toLowerCase() === correctCountry.trim().toLowerCase()){
      setCorrectAns((prevScore)=> prevScore + 1);

      newStreak = streak + 1
      setStreak(newStreak);
      
      let newMultiplier = 1
      if (newStreak >= 10) newMultiplier = 5
      else if (newStreak >= 5) newMultiplier = 3
      else if (newStreak >= 3) newMultiplier = 2
      else if (newStreak >= 2) newMultiplier = 1.5

      setMultiplier(newMultiplier)

      setAnswerStatus("correct")
      tempScore = tempScore + 100
      correctAudio.current.currentTime = 0
      correctAudio.current.play()
    }else{
      setWrongAns((prevScore)=> prevScore + 1);
      setStreak(0)
      setMultiplier(1)
      setAnswerStatus("wrong")
      tempScore = tempScore - 100
      wrongAudio.current.currentTime = 0
      wrongAudio.current.play()
    }
    setScore(tempScore)

    //if score earned in session is higher than highestScore store in db
    if(tempScore > highestScore){
        await axios.post(`${API_BASE_URL}/save-score`, {
          clerkId: user.id,
          gameMode: "country",
          score: tempScore
        })
        setHighestScore(prev => Math.max(prev, tempScore))
    }
    setTimeout(() => {
        setUserInput(""); // Clear input after submission
        getQuestion(); // Get new Question
    }, 1000);
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
    <div className='guess-country'>
    <img src={background} className="bg_img"/>
    <div className="music-toggle" onClick={toggleMusic}>
      {isMusicOn ? "🔊" : "🔇"}
    </div>

    {/* Left side */}
      <div className="left-panel">
        <h2 className="panel-title">STATISTICS</h2>
        {/* Highest Score */}
        <div className="highest-score-card">
          <div className="crown">👑</div>
          <p className="score-label">HIGHEST SCORE</p>
          <h1 className="score-value">{highestScore}</h1>
        </div>

        {/* Game Metrics */}
        <div className="metrics-card">
          <p>GAME METRICS</p>
          <span>Current Score: <b className="current-score">{score}</b></span>
        </div>

        {/* Answers */}
        <div className="answers-card">
          <div className="correct-box">
              ✔ Correct: {CorrectAns}
          </div>
          <div className="wrong-box">
              ✖ Wrong : {WrongAns}
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-box">
            🔥 Streak: <b>{streak}</b>
          </div>

          <div className="multiplier-box">
            <p className="multiplier-value">{multiplier}X</p>
            <span className="multiplier-label">Score Multiplier</span>
          </div>
        </div>
      </div>

    {/* Middle section */}
      <div className="center-panel">
        {/* Flag */}
        <div className="flag-container">
            {flag && (
              <img
                src={`/countryFlags/${flag}.svg`}
                alt="country flag"
                className="flag-image"
              />
            )}
        </div>
        <input
          type="text"
          placeholder="Enter the country name..."
          className="country-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSubmit}>
            SUBMIT ✓
        </button>
        <div className='result-text'>
          {answerStatus === 'correct' && (
            <p className="correct">Correct</p>
          )}
          {answerStatus === 'wrong' && (
            <p className="wrong">Wrong</p>
          )}
        </div>

      </div>

      {/* right-section */}
      <div className="right-panel">
        <h2 className="panel-title">INTELLIGENCE</h2>
        {/* Hints */}
        <div className="hint-card">
            <p className="hint-title">HINTS</p>
            <div className="hint-buttons">
                <button className="hint-btn fact-btn">
                    <span className='hint-logo'>💡</span>
                    <span className='hint-text'>Reveal Fact</span>
                </button>
                <button className="hint-btn continent-btn">
                    <span className='hint-logo'>🌍</span>
                    <span className='hint-text'>Reveal Continent</span>
                </button>
            </div>
        </div>

        {/* Information Box */}
        <div className="info-card">
            <h3>DID YOU KNOW?</h3>
            <p className="info-text">
              ???
            </p>
        </div>
      </div>

    </div>
  )
}

export default GuessCountry