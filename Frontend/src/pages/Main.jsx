import { useEffect, useState,useRef } from 'react'
import axios from 'axios'
import "./main.css"
import background from '../assets/mainPage/background.avif'
import GameModeCard from '../Components/GameModeCard'
import { useNavigate } from "react-router-dom";
import { Show,SignInButton, UserButton, useUser } from "@clerk/react";
import toast from "react-hot-toast"
import music from "../assets/sounds/lofi3.mp3"

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const Main = () => {
  const navigate = useNavigate();
  const { user } = useUser()
  const bgmusic = useRef(new Audio(music))

  function startMusic(){
    if(isMusicOn && bgmusic.current.paused){
      bgmusic.current.play().catch(()=>{})
    }
  }

  function startGame(mode){
    startMusic()
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

  const [highestScoreGuessCountry, setHighestScoreGuessCountry] = useState(0)
  const [highestScoreGuessCapital, setHighestScoreGuessCapital] = useState(0)
  const [leaderboard,setLeaderboard] = useState([])
  const [isMusicOn, setIsMusicOn] = useState(false)

  //function to get leaderboard data
  function fetchLeaderboard(){
    axios
      .get(`${API_BASE_URL}/leaderboard`)
      .then(res => {
        setLeaderboard(res.data)
      })
      .catch(err => console.log(err))
  }
  useEffect(()=>{
    fetchLeaderboard()
  },[])

  useEffect(() => {
    bgmusic.current.loop = true
    bgmusic.current.volume = 0.3
    return () => {
      bgmusic.current.pause()
    }
  }, [])

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

  function toggleMusic(){
    if(isMusicOn){
      bgmusic.current.pause()
    }else{
      bgmusic.current.play().catch(()=>{})
    }
    setIsMusicOn(!isMusicOn)
  }

  return (
  <div className="main-page">
    <img src={background} className="bg-img"/>
    <div className="music-toggle" onClick={toggleMusic}>
      {isMusicOn ? "🔊" : "🔇"}
    </div>
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

        <GameModeCard
          icon="🗺️"
          title="MAP MASTER"
          description="Locate countries on the globe."
        />
        <GameModeCard isComingSoon={true} />
      </div>

      {/* LeaderBoard */}
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
          
          {leaderboard.map((player, index) => (
            <div
              className={`table-row ${index === 0 ? "top-1" : ""}`}
              key={player.id}
            >
              <span>{String(index + 1).padStart(2,"0")}</span>
              <span>{player.username}</span>
              <span>{player.total_score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

export default Main