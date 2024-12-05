import React from 'react';

interface PlayerInputProps {
  players: string[];
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ players, setPlayers }) => {
  const handlePlayerNameChange = (index: number, value: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((name, i) => (i === index ? value : name))
    );
  };

  return (
    <div className="player-input">
      {players.map((player, index) => (
        <div key={index} className="player">
          <label htmlFor={`player-${index}`}>
            Player {index + 1}:
          </label>
          <input
            id={`player-${index}`}
            type="text"
            value={player}
            placeholder={`Enter Player ${index + 1} Name`}
            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default PlayerInput;
