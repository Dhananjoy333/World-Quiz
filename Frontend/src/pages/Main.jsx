import React, { useEffect, useState } from 'react'
import axios from 'axios'
import "./main.css"
const API_BASE_URL = import.meta.env.VITE_API_URL ;


const Main = () => {
  //highestScore of guess country and guess capital
  const [highestScoreGuessCountry, setHighestScoreGuessCountry] = useState(0)
  const [highestScoreGuessCapital, setHighestScoreGuessCapital] = useState(0)

  //fetching the highest Score from backend
  function fetchHighestScore() {
    axios
      .get(`${API_BASE_URL}/highScore`) 
      .then((response) => {
        setHighestScoreGuessCapital(response.data.highScoreOfGuessCapital)
        setHighestScoreGuessCountry(response.data.highScoreOfGuessCountry)
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
      });
  };

  //run once on startup
  useEffect(() =>{
    fetchHighestScore()
  },[])

  return (
    <div className='main-page'>
      <div className="left">
        <div className="left-content">
          <p className="left-score">Highest Score : {highestScoreGuessCapital}</p>
          <p className="game-description">Guess capital name from country name</p>
          <a href='/guess-capital' className='Go-GuessCapital-btn btn'>GO</a>
        </div>
      </div>
      <div className="right">
        <div className="right-content">
          <p className="right-score">Highest Score : {highestScoreGuessCountry}</p>
          <p className="game-description">Guess country name from country flag</p>
          <a href="/guess-country"  className='Go-GuessCountry-btn btn'>GO</a>
        </div>        
      </div>    
    </div>
  )
}

export default Main