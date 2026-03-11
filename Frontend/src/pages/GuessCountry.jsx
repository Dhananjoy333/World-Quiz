import React,{useState,useEffect} from 'react'
import axios from 'axios'
import "./guessCountry.css"
import background from "../assets/mainPage/bg_country.png"
import dummyflag from "../assets/mainPage/in.svg"

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
    // <div id="app" className='guess-country'>
    //     <form className="container" action="/submit" method="post">
    //     <h3 className='guess-capital-highest-score'>
    //             <img src={crown} className='crown'/>
    //             Highest Score : 
    //                   <span id="score" style={{ color: "black" }}> {highestScore}</span>
    //             </h3>
    //     <h3>
    //           Current Score : 
    //           <span id="score" style={{ color: "black" }}> {score}</span>
    //     </h3>
    //         <div className="horizontal-container">
    //             <h3>
    //                 Correct answers : 
    //                 <span id="score" style={{ color: "green" }}> {CorrectAns}</span>
    //             </h3>
    //             <h3>
    //                 Wrong answers : 
    //                 <span id="score" style={{ color: "red"  }}> {WrongAns}</span>
    //             </h3>
    //         </div>

    //         {flag && <img  src={flag} alt="Country Flag" width="150" height="100" className='country-flag'/>}
    //         <div className="answer-container">
    //             <input 
    //                 type="text" 
    //                 name="answer" 
    //                 id="userInput" 
    //                 placeholder="Enter the country name" autoFocus autoComplete="off" 
    //                 onChange={handleChange} 
    //                 value={userInput}
    //             />
    //         </div>
    //         <button type="submit" onClick={handleSubmit}>SUBMIT
    //         {isSubmitted && (
    //         userInput.toLowerCase().trim() === correctCountry.toLowerCase().trim() ? (
    //           <span className="checkmark">✔</span>
    //         ) : (
    //           <span className="cross" id="error">✖</span>
    //         )
    //       )}
    //         </button>
    //     </form>
    // </div>
    <div className='guess-country'>
    <img src={background} className="bg_img"/>

    
    {/* Left side */}
      <div className="left-panel">
        <h2 className="panel-title">STATISTICS</h2>
        {/* Highest Score */}
        <div className="highest-score-card">
          <div className="crown">👑</div>
          <p className="score-label">HIGHEST SCORE</p>
          <h1 className="score-value">12,500</h1>
        </div>

        {/* Game Metrics */}
        <div className="metrics-card">
          <p>GAME METRICS</p>
          <span>Current Score: <b className="current-score">850</b></span>
        </div>

        {/* Answers */}
        <div className="answers-card">
          <div className="correct-box">
              ✔ Correct: 17
          </div>
          <div className="wrong-box">
              ✖ Wrong : 3
          </div>
        </div>
      </div>

    {/* Middle section */}
      <div className="center-panel">
        {/* Flag */}
        <div className="flag-container">
            <img 
              src={dummyflag} 
              alt="country flag"
              className="flag-image"
            />
        </div>
        {/* Input */}
        <input
          type="text"
          placeholder="Enter the country name..."
          className="country-input"
        />
        {/* Submit */}
        <button className="submit-btn">
            SUBMIT ✓
        </button>
        {/* Result */}
        <p className="result-text correct">Correct</p>
        {/* change to "wrong" class when wrong */}
      </div>

      {/* right-section */}
      <div className="right-panel">
        <h2 className="panel-title">INTELLIGENCE</h2>
        {/* Hints */}
        <div className="hint-card">
            <p className="hint-title">HINTS</p>
            <div className="hint-buttons">
                <button className="hint-btn fact-btn">
                    💡
                    <span>Reveal Fact</span>
                </button>
                <button className="hint-btn continent-btn">
                    🌍
                    <span>Reveal Continent</span>
                </button>
            </div>
        </div>

        {/* Information Box */}
        <div className="info-card">
            <h3>DID YOU KNOW?</h3>
            <p className="info-text">
              The flag of Palestine dates back to the early 20th century.
            </p>
        </div>
      </div>

    </div>
  )
}

export default GuessCountry