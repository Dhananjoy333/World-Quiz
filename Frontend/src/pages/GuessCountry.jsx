import React,{useState,useEffect} from 'react'
import axios from 'axios'
import "./guessCountry.css"
import crown from "../assets/crown.png"
const API_BASE_URL = import.meta.env.VITE_API_URL;


const GuessCountry = () => {
    const [highestScore, setHighestScore] = useState(0)
    const [score,setScore] = useState(0)
    const [CorrectAns,setCorrectAns] = useState(0)
    const [WrongAns,setWrongAns] = useState(0)
    const [flag, setFlag] = useState("")
    const [userInput, setUserInput] = useState("") //will use to check with actual ans
    const [correctCountry, setCorrectCountry] = useState("")
    const [isSubmitted,setIsSubmitted] = useState(false)

    //fetching data from backend
    function getQuestion(){
        axios
            .get(`${API_BASE_URL}/flags`)
            .then((response) =>{
                setFlag(response.data.country_code)
                setCorrectCountry(response.data.name)   //will use to check with userinput
            })
            .catch((error) =>{
                console.error("Couldn't fetch Question: ",error)
            })
    }
    //fetching the highest Score from backend
  function fetchHighestScore() {
    axios
      .get(`${API_BASE_URL}/highScore`) 
      .then((response) => {
        setHighestScore(response.data.highScoreOfGuessCountry)
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
      });
  };

    useEffect(() =>{
        fetchHighestScore()
        getQuestion()},[]
    )

    function handleChange(event){
        setUserInput(event.target.value)
    }

    async function handleSubmit(event){
        event.preventDefault();

    let tempScore = score
    if(userInput.trim().toLowerCase() === correctCountry.trim().toLowerCase()){
      setCorrectAns((prevScore)=> prevScore + 1);
      tempScore = tempScore + 100
    }else{
      setWrongAns((prevScore)=> prevScore + 1);
      tempScore = tempScore - 100
    }
    setScore(tempScore)

    //if score earned in session is higher than highestScore store in db
    if(tempScore > highestScore){
        const response = await axios.post(`${API_BASE_URL}/high-score-country`,{tempScore})
        setHighestScore(response.data.highestScore)
    }
    
    setIsSubmitted(true)
    setTimeout(() => {
        setIsSubmitted(false); // Reset submission state after delay
        setUserInput(""); // Clear input after submission
        getQuestion(); // Get new Question
    }, 1000);
}

  return (
    <div id="app" className='guess-country'>
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

            {flag && <img  src={flag} alt="Country Flag" width="150" height="100" className='country-flag'/>}
            <div className="answer-container">
                <input 
                    type="text" 
                    name="answer" 
                    id="userInput" 
                    placeholder="Enter the country name" autoFocus autoComplete="off" 
                    onChange={handleChange} 
                    value={userInput}
                />
            </div>
            <button type="submit" onClick={handleSubmit}>SUBMIT
            {isSubmitted && (
            userInput.toLowerCase().trim() === correctCountry.toLowerCase().trim() ? (
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

export default GuessCountry