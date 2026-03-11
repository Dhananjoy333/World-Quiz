import {useState,useEffect} from 'react'
import axios from "axios";
import "./guessCapital.css"
import background from "../assets/mainPage/bg_capital.png"


const API_BASE_URL = import.meta.env.VITE_API_URL;

const GuessCapital = () => {
  //setting states for score, countryName and correctCapital just for checking
    const [highestScore, setHighestScore] = useState(0)
    const [score,setScore] = useState(0)
    const [CorrectAns,setCorrectAns] = useState(0)
    const [WrongAns,setWrongAns] = useState(0)
    const [countryName,setCountryName] = useState("")
    const [correctCapital,setCorrectCapital] = useState("")
    const [userCapital,setUserCapital] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)//to show ✔ or X only after submit


  // Fetch question from backend using Axios
  function fetchNewQuestion() {
    axios
      .get(`${API_BASE_URL}/question`) 
      .then((response) => {
        setCountryName(response.data.country);
        setCorrectCapital(response.data.capital) // Update state with received data 
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
      });
  };
  //fetching the highest Score from backend
  function fetchHighestScore() {
    axios
      .get(`${API_BASE_URL}/highScore`) 
      .then((response) => {
        setHighestScore(response.data.highScoreOfGuessCapital)
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
      });
  };

  //run once when website load
  useEffect(() => {
    fetchHighestScore()
    fetchNewQuestion()},[]
  );

  //handling Capital name input
  function handleChange(event){
    setUserCapital(event.target.value)
  }

  //handle capital name submission
  async function handleSubmit(event){
    event.preventDefault(); //prevent default reload

    let tempScore = score
    if(userCapital.trim().toLowerCase() == correctCapital.trim().toLowerCase()){
      setCorrectAns((prevScore)=> prevScore + 1);
      tempScore = tempScore + 100
    }else{
      setWrongAns((prevScore)=> prevScore + 1);
      tempScore = tempScore - 100
    }
    setScore(tempScore)

    //if score earned in session is higher than highestScore store in db
    if(tempScore > highestScore){
      const response = await axios.post(`${API_BASE_URL}/high-score`,{tempScore})
      setHighestScore(response.data.highestScore)
    }
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false); // Reset submission state after delay
      setUserCapital(""); // Clear input after submission
      fetchNewQuestion(); // Get new Question
    }, 1000); // Delay before fetching new question to show feedback
  }
    
  return (
  <div className="guess-country">
  <img src={background} className="bg_img" />
    <div className="ui-panel">
      {/* top score board */}
      <div className="top-score">
        <div className="highest">
          <p>HIGHEST SCORE</p>
          <h1>{highestScore}</h1>
        </div>

        <div className="answer-status">
          <span className="correct">CORRECT</span>
        </div>

        <div className="current">
          <p>CURRENT SCORE</p>
          <h1>{score}</h1>
        </div>
      </div>

    {/* main area */}
      <div className="center-game">
        <h1 className="country-name">FRANCE</h1>
        <input
          type="text"
          className="capital-input"
          placeholder="ENTER CAPITAL"
          value={userCapital}
          onChange={(e) => setUserCapital(e.target.value.trim())}     
        />

        <button className="submit-btn" onClick={handleSubmit}>
          SUBMIT
        </button>

      {/* powerUps */}
        <div className="powerups-box">
          <h3>POWERUPS</h3>
          <div className="powerups">
            <div className="powerup">
              <p>2X</p>
              <span>Score Multiplier</span>
            </div>

            <div className="powerup">
              <p>💡</p>
              <span>Hint</span>
            </div>

            <div className="powerup">
              <p>🔥</p>
              <span>Streak</span>
            </div>

          </div>
        </div>

      </div>

    </div>
    <div className="score-stats">
      <h3>SCORE STATS</h3>
      <div className="stat-row">
        <span>Correct Answers</span>
        <span className="correct-num">25</span>
      </div>

      <div className="stat-row">
        <span>Wrong Answers</span>
        <span className="wrong-num">3</span>
      </div>

    </div>
  </div>
  )
}

export default GuessCapital