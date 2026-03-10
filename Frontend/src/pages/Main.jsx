import { useEffect, useState } from 'react'
import axios from 'axios'
import "./main.css"
import background from '../assets/mainPage/background.png'
import GameModeCard from '../Components/GameModeCard'
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const Main = () => {
  const navigate = useNavigate();

  function startGame(mode){
    if(mode === "flag"){
      navigate("/guess-country")
    }
    if(mode === "capital"){
      navigate("/guess-capital")
    }
  }
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
  <div className="main-page">
    <img src={background} className="bg-img"/>
    <div className="menu">
      <div className="navbar">
        <div className="logo"><span>🌍</span>WORLDQUIZ</div>

        <div className="nav-links">
          <span>LEADERBOARD</span>
          <button className="login-btn">LOGIN</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-title">
          WORLD <span className="hero-globe">🌍</span> QUIZ
        </div>

        <div className="mode-banner">
          <p className="hero-subtitle">SELECT A GAME MODE</p>
        </div>
      </div>

    {/* Game mode */}
      <div className="game-modes">
        <GameModeCard
          icon="🏳️"
          title="FLAG QUIZ"
          description="Identify nations by their colors."
          onStart={() => startGame("flag")}
        />
        <GameModeCard
          icon="🌆"
          title="CAPITAL QUIZ"
          description="Test your knowledge of world seats."
          onStart={() => startGame("capital")}
        />
        {/* You can now easily add more modes like this: */}
        <GameModeCard
          icon="🗺️"
          title="MAP MASTER"
          description="Locate countries on the globe."
        />
        <GameModeCard isComingSoon={true} />
      </div>

      {/* NEW: GLOBAL LEADERBOARD SECTION */}
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <span className="star">★</span>
          <h2>GLOBAL HALL OF FAME</h2>
          <span className="star">★</span>
        </div>
        
        <div className="leaderboard-table">
          <div className="table-header">
            <span>RANK</span>
            <span>PLAYER</span>
            <span>SCORE</span>
          </div>
          
          {/* Example Rows - You'll map these later */}
          <div className="table-row top-1">
            <span>01</span>
            <span>PIXEL_PRO</span>
            <span>99999</span>
          </div>
          <div className="table-row">
            <span>02</span>
            <span>WORLD_WIZ</span>
            <span>85400</span>
          </div>
          <div className="table-row">
            <span>03</span>
            <span>QUIZ_KING</span>
            <span>72100</span>
          </div>
        </div>
      </div>

    </div>
  </div>
  )
}

export default Main