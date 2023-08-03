// src/ReplayButton.js
import React from "react";

const ReplayButton = ({ onClick }) => {
  const handleReplayClick = (event) => {
    event.preventDefault();
    onClick();
  };

  return <button onClick={handleReplayClick}>Replay</button>;
};

export default ReplayButton;
