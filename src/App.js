// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { random } from "lodash";
import YouTube from "react-youtube"; // Import the react-youtube package

const decades = ["1960s-", "1970s-", "1980s-", "1990s-", "2000s-", "2010s-"];

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const App = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [decadeSongs, setDecadeSongs] = useState({});

  useEffect(() => {
    const fetchSongsData = async () => {
      const songsDataPromises = decades.map(async (decade) => {
        const response = await fetch(`/data/${decade}songs.json`);
        const data = await response.json();
        return { decade, data: data.songs };
      });
      const songsDataArray = await Promise.all(songsDataPromises);
      const songsDataObj = songsDataArray.reduce((acc, { decade, data }) => {
        acc[decade] = data;
        return acc;
      }, {});
      setDecadeSongs(songsDataObj);
    };

    fetchSongsData();
  }, []);

  const getRandomSong = () => {
    const randomDecadeIndex = random(0, decades.length - 1);
    const decade = decades[randomDecadeIndex];
    const songsInDecade = decadeSongs[decade] || [];

    const randomSongIndex = random(0, songsInDecade.length - 1);
    const randomSong = songsInDecade[randomSongIndex];

    return randomSong;
  };

  const playRandomSong = async () => {
    const song = getRandomSong();
    const query = `${song.song} by ${song.artist} (Official Video)`;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            q: query,
            part: "snippet",
            type: "video",
            videoDuration: "medium", // Optional: Filter results by video duration (short, medium, long)
            maxResults: 5, // You can adjust this value to get more or fewer results
            key: API_KEY,
          },
        }
      );

      const items = response.data.items;
      if (items.length > 0) {
        const randomIndex = random(0, items.length - 1);
        const videoId = items[randomIndex].id.videoId;
        setCurrentSong({ ...song, videoId });
      } else {
        console.log(`No video found for query: ${query}`);
        // You can add logic here to handle the case when no video is found for the query
      }
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  const handlePlayButton = () => {
    playRandomSong();
  };

  const youtubePlayerRef = React.useRef(null);

  const opts = {
    playerVars: {
      autoplay: 1, // Autoplay the video when it's ready
      controls: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      height: "0",
      enablejsapi: 1,
    },
  };

  const handleReplayButton = () => {
    const player = youtubePlayerRef.current;
    if (player) {
      const startTime = Math.floor(Math.random() * (player.getDuration() - 5));
      player.seekTo(startTime);
      player.playVideo();
    }
  };

  return (
    <div>
      <h1>YouTube Music App</h1>
      {currentSong ? (
        <div>
          <h2>{currentSong.song}</h2>
          <p>{currentSong.artist}</p>
          <p>{currentSong.year}</p>
          <YouTube
            videoId={currentSong.videoId}
            opts={opts}
            ref={youtubePlayerRef}
          />
          <button onClick={handleReplayButton}>Replay</button>
        </div>
      ) : (
        <button onClick={handlePlayButton}>Play Random Song</button>
      )}
    </div>
  );
};

export default App;
