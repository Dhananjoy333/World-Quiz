import React,{useState,useEffect} from 'react'
import axios from "axios";
import "./guessCapital.css"
import crown from "../assets/crown.png"
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_BASE_URL = "https://world-quiz-backend.onrender.com/api";

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
    <div id="app" className='guess-capital'>
        <form className="container" action="/submit" method="post">
        <h3 className='guess-capital-highest-score'>
        <img src={crown} className='crown'/>
        Highest Score : 
              <span id="score" style={{ color: "black" }}> {highestScore}</span>
        </h3>
        <h3>
              Current Score : 
              <span id="score" style={{ color: "black" }}> {score}</span>
        </h3>
            <div className="horizontal-container">
                <h3>
                    Correct answers : 
                    <span id="score" style={{ color: "green" }}> {CorrectAns}</span>
                </h3>
                <h3>
                    Wrong answers : 
                    <span id="score" style={{ color: "red"  }}> {WrongAns}</span>
                </h3>
            </div>

            <h1 id="countryName">{countryName}</h1>
            <div className="answer-container">
                <input type="text" name="answer" id="userInput" placeholder="Enter the capital" autoFocus autoComplete="off" onChange={handleChange} value={userCapital}/>
                
            </div>
            <button type="submit" onClick={handleSubmit}>SUBMIT
            {isSubmitted && (
            userCapital.toLowerCase() === correctCapital.toLowerCase() ? (
              <span className="checkmark">✔</span>
            ) : (
              <span className="cross" id="error">✖</span>
            )
          )}
            </button>
        </form>
    </div>
  )
}

export default GuessCapital