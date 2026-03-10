import { useState } from "react";
import './gameMode.css'

function GameModeCard({ icon, title, description, isComingSoon, onStart }) {
  const [highScore, setHighScore] = useState(0);

  if (isComingSoon) {
    return (
      <div className="arcade-cabinet coming-soon">
        <div className="cabinet-top">
          <span className="hi-score-lcd">OFFLINE</span>
        </div>
        <div className="cabinet-screen">
          <div className="out-of-order-tape">COMING SOON</div>
          <div className="game-icon">❓</div>
        </div>
        <div className="cabinet-panel">
          <h3 className="game-title">???</h3>
          <p className="game-desc">More game modes are being developed!</p>
          <button className="play-btn locked" disabled>LOCKED</button>
        </div>
      </div>
    );
  }

  return (
    <div className="arcade-cabinet">
      {/* The Top Marquee */}
      <div className="cabinet-top">
        <span className="hi-score-lcd">HI-SCORE: {highScore.toString().padStart(5, '0')}</span>
      </div>

      {/* The CRT Screen */}
      <div className="cabinet-screen">
        <div className="screen-flicker"></div>
        <div className="game-icon">{icon}</div>
      </div>

      {/* The Control Panel */}
      <div className="cabinet-panel">
        <h3 className="game-title">{title}</h3>
        <p className="game-desc">{description}</p>
        <button className="play-btn" onClick={onStart}>START</button>
      </div>
    </div>
  );
}

export default GameModeCard;