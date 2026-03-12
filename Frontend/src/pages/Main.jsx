import { useEffect, useState } from 'react'
import axios from 'axios'
import "./main.css"
import background from '../assets/mainPage/background.png'
import GameModeCard from '../Components/GameModeCard'
import { useNavigate } from "react-router-dom";
import { Show,SignInButton, UserButton, useUser } from "@clerk/react";
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const Main = () => {
  const navigate = useNavigate();
  const { user } = useUser()

  function startGame(mode){
    if(!user){
      toast("⚠️ Login to save your score")
    }

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
  useEffect(() => {
    if(user){
      Promise.all([
        axios.get(`${API_BASE_URL}/highscore/country/${user.id}`),
        axios.get(`${API_BASE_URL}/highscore/capital/${user.id}`)
      ])
      .then(([countryRes, capitalRes]) => {
        setHighestScoreGuessCountry(countryRes.data.highScore)
        setHighestScoreGuessCapital(capitalRes.data.highScore)
      })
      .catch(err => console.log(err))
    }else{
      return
    }
  }, [user])

  return (
  <div className="main-page">
    <img src={background} className="bg-img"/>
    <div className="menu">
      <div className="navbar">
        <div className="logo"><span>🌍</span>WORLDQUIZ</div>

        <div className="nav-links">
          <span>LEADERBOARD</span>
          <Show when="signed-out">
            <SignInButton>
              <button className="login-btn">LOGIN</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
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
          description="Identify nations by their flags."
          highScore={highestScoreGuessCountry}
          onStart={() => startGame("flag")}
        />
        <GameModeCard
          icon="🌆"
          title="CAPITAL QUIZ"
          description="Test your knowledge of country capitals."
          highScore={highestScoreGuessCapital}
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