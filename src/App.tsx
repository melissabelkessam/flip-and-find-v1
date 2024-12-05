import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

const TimerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [players, setPlayers] = useState<{ name: string; points: number }[]>(
    location.state?.players || []
  );
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const updatePoints = (points: number) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, index) =>
        index === selectedPlayerIndex
          ? { ...player, points: player.points + points }
          : player
      )
    );
  };

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsRunning(false);
  };

  const handleRestart = () => {
    setTimeLeft(10);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
    setIsRunning(true);
  };

  const handleShowResults = () => {
    navigate('/results', { state: { players } });
  };

  return (
    <div className="app-container">
      <header className="logo-container">
        <img src="/logo-timer.png" alt="Flip & Find Logo" className="logo-timer" />
      </header>

      <audio ref={audioRef} src="/stress-sound.mp3" loop />

      <div className="timer-points-container">
        <div className="timer-card">
          <h1 className="timer-title">Game Timer</h1>
          <h2 className="timer">Time Left: {timeLeft}s</h2>
          <div className="timer-controls">
            <button className="timer-btn" onClick={handleStart} disabled={isRunning}>
              Start
            </button>
            <button className="timer-btn" onClick={handlePause} disabled={!isRunning}>
              Pause
            </button>
            <button className="timer-btn restart-btn" onClick={handleRestart}>
              Restart
            </button>
          </div>

          <div className="player-select">
            <label htmlFor="player-select">Select Player:</label>
            <select
              id="player-select"
              value={selectedPlayerIndex}
              onChange={(e) => setSelectedPlayerIndex(parseInt(e.target.value))}
            >
              {players.map((player, index) => (
                <option key={index} value={index}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            <button onClick={() => updatePoints(1)}>+1 Point</button>
            <button onClick={() => updatePoints(2)}>+2 Points</button>
            <button onClick={() => updatePoints(-1)}>-1 Point</button>
            <button onClick={() => updatePoints(-2)}>-2 Points</button>
            <button onClick={() => updatePoints(5)}>+5 Points</button>
            <button onClick={() => updatePoints(-5)}>-5 Points</button>
          </div>
        </div>

        <div className="points-card">
          <h1 className="points-title">Score</h1>
          <ul className="points-list">
            {players.map((player, index) => (
              <li key={index} className="player-points">
                {player.name}: {player.points} pts
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="show-results-btn" onClick={handleShowResults}>
        Show Results
      </button>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const players: { name: string; points: number }[] = location.state?.players || [];

  // Trier les joueurs par score décroissant
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const winner = sortedPlayers[0];

  const handleReplay = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Congratulations!</h1>
      <div className="winner-banner">
        🎉 {winner.name} is the Winner with {winner.points} pts! 🎉
      </div>
      <div className="results-card">
        <h2>Final Rankings</h2>
        <ul>
          {sortedPlayers.map((player, index) => (
            <li key={index} className={`player-ranking ${index === 0 ? 'winner' : ''}`}>
              {index + 1}. {player.name}: {player.points} pts
            </li>
          ))}
        </ul>
        <button className="replay-btn" onClick={handleReplay}>
          Replay
        </button>
      </div>
    </div>
  );
};

const AddPlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<string[]>(['', '']);
  const navigate = useNavigate();

  const arePlayersReady = players.length >= 2 && players.every((name) => name.trim() !== '');

  const handleAddPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, '']);
    }
  };

  const handleRemovePlayer = () => {
    if (players.length > 2) {
      setPlayers(players.slice(0, -1));
    }
  };

  const handleStartGame = () => {
    const initializedPlayers = players.map((name) => ({
      name: name.trim(),
      points: 0,
    }));
    navigate('/timer', { state: { players: initializedPlayers } });
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Welcome to Flip & Find</h1>
      <div className="central-section">
        {players.map((player, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Player ${index + 1} Name`}
            value={players[index]}
            onChange={(e) =>
              setPlayers(players.map((name, i) => (i === index ? e.target.value : name)))
            }
          />
        ))}
        <div className="player-controls">
          <button onClick={handleAddPlayer} disabled={players.length >= 4}>
            Add Player
          </button>
          <button onClick={handleRemovePlayer} disabled={players.length <= 2}>
            Remove Player
          </button>
        </div>
        <button
          className={`start-game-btn ${arePlayersReady ? '' : 'disabled'}`}
          onClick={handleStartGame}
          disabled={!arePlayersReady}
        >
          Start the Game
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AddPlayersPage />} />
      <Route path="/timer" element={<TimerPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
};

export default App;
