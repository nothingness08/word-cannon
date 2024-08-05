"use client"
import "./globals.css";
import React, { useState, useEffect, useCallback } from 'react';
import Balls from "./Balls";
import Cannon from "./Cannon";
import Images from "./Images";

function randomInt(max) {
  return Math.floor(Math.random() * (max+1));
}

function randomWord(correctWord) {
  const words = ["ring", "drink", "fang", "king", "strong", "swing", "stung", "stink", "bank", "junk", "pink", "wing"];
  const probability = 0.33;
  let additionalCorrectWords = Math.floor(((probability*words.length) -1)/(1-probability));

  if (correctWord) {
    const weightedWords = [...Array(additionalCorrectWords).fill(correctWord), ...words]; 
    return weightedWords[randomInt(weightedWords.length -1)];
    //probability of correct word chosen is (4+1)/16
    //probability of other word chosen is 1/16
  } 
  return words[randomInt(words.length - 1)];
}

function wordToURL(word){
  return ('/images/' + word + '.png');
}

export default function Home() {
  const [cannonPos, setCannonPos] = useState({x: 240, y: 480});
  const [balls, setBalls] = useState([]);
  const [gameOver, setGameOver] = useState(false); //game over?
  const [gameStarted, setGameStarted] = useState(false);
  const [keysPressed, setKeysPressed] = useState({ Left: false, Right: false });
  const [lastPressed, setLastPressed] = useState("");
  const [correctWord, setCorrectWord] = useState("");
  const [images, setImages] = useState([]);
  const [score, setScore] = useState(0);
  const [canFire, setCanFire] = useState(true);

  useEffect(() => {
    if(gameStarted){
      setCorrectWord(randomWord(null));
    }
	  const ballsMove = setInterval(() => {
	    if(!gameOver && gameStarted){
        setBalls((prev) =>
          prev
          .map((ball) => ({ ...ball, y: ball.y - 8 }))
          .filter((ball) => ball.y > -20)
        );
      }
	  }, 20);

    const imagesMove = setInterval(() => {
	    if(!gameOver && gameStarted){
        setImages((prev) =>
          prev
          .map((image) => ({ ...image, y: image.y + 1 }))
          .filter((image) => image.y < 600)
        );
      }
	  }, 20);

		return () => {
			clearInterval(ballsMove);
      clearInterval(imagesMove);
    };
  }, [gameOver, gameStarted]);

  useEffect(() => {
	  const cannonMove = setInterval(() => {
      const canMoveRight = cannonPos.x <= 478;
      const canMoveLeft = cannonPos.x >= 0;
	    if(!gameOver && gameStarted){
        if(lastPressed === "Left" && keysPressed.Left && canMoveLeft){
          setCannonPos((prev) => ({...prev, x: prev.x - 4}));
        }
        else if(lastPressed === "Right" && keysPressed.Right && canMoveRight){
          setCannonPos((prev) => ({...prev, x: prev.x + 4}));
        }
        else if(keysPressed.Left && canMoveLeft){
          setCannonPos((prev) => ({...prev, x: prev.x - 4}));
        }
        else if(keysPressed.Right && canMoveRight){
          setCannonPos((prev) => ({...prev, x: prev.x + 4}));
        }
      }
	  }, 20);

		return () => {
			clearInterval(cannonMove);
		};
  }, [keysPressed, cannonPos, gameStarted, gameOver]);

  useEffect(() => {
    const spawnImages = setInterval(() => {
      if(gameStarted && !gameOver){
        const randWord = randomWord(correctWord);
        setImages((prev) => [
          ...prev,
          { x: randomInt(500) + 50, y: 0, url: wordToURL(randWord), word: randWord},
        ]);
      }
	  }, 1700);

		return () => {
			clearInterval(spawnImages);
		};
  }, [gameStarted, gameOver, correctWord]);

  const fireCannon = useCallback(() => {
    if(canFire){
      setBalls((prev) => [
        ...prev,
        { x: cannonPos.x + 55, y: cannonPos.y - 8 },
      ]);
      setCanFire(false);
    }
  }, [cannonPos, canFire]);

  useEffect(() => {
    const fireReset = setInterval(() => {
      setCanFire(true);
	  }, 400);

		return () => {
			clearInterval(fireReset);
		};
  }, []);

  const checkCollision = () => {
    let updatedBalls = [...balls];
    let updatedImages = [...images];

		balls.forEach((ball, ballIndex) => {
			const ballTop = ball.y;
			const ballBottom = ball.y + 20;
			const ballLeft = ball.x;
			const ballRight = ball.x + 20;
      images.forEach((image, imageIndex) => {
        const imageTop = image.y;
			  const imageBottom = image.y + 40;
			  const imageLeft = image.x;
			  const imageRight = image.x + 40;

        const isColliding = 
        ballTop < imageBottom && 
        ballBottom > imageTop &&
        ballLeft < imageRight &&
        ballRight > imageLeft;
        if(isColliding){
          if (image.word === correctWord) {
            setScore((prevScore) => prevScore + 1);
            setCorrectWord(randomWord(null));
          }
          else{
            setGameOver(true);
          }
          updatedBalls = updatedBalls.filter((_, idx) => idx !== ballIndex);
          updatedImages = updatedImages.filter((_, idx) => idx !== imageIndex);
        }
      })
		});
    setBalls(updatedBalls);
    setImages(updatedImages);
	};

  useEffect(() => {
    checkCollision();
  }, [balls, gameOver]);

  const handleKeyDown = useCallback((event) => { 
    const newDirection = event.key.replace("Arrow", ""); 
    if (["Left", "Right"].includes(newDirection)) { 
      setKeysPressed((prev) => ({...prev, [newDirection]: true}));
      setLastPressed(newDirection);
    }
    if(event.key === " "){
      fireCannon();
    }
    if(!gameStarted || gameOver){
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setImages([]);
      setCannonPos({x: 240, y: 480});
    }
  }, [fireCannon, gameOver]);

  const handleKeyUp = useCallback((event) => {
    const newDirection = event.key.replace("Arrow", "");
    if (["Left", "Right"].includes(newDirection)) {
      setKeysPressed((prev) => ({ ...prev, [newDirection]: false }));
    }
  }, []);


  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);


    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

    };
  }, [handleKeyDown, handleKeyUp]);


  return (
    <div>
      <div className="Game">
        <Cannon cannonPos={cannonPos} word={correctWord} />
        {balls.map((ball, index) => (
          <Balls key={index} ballPosition={ball} />
        ))}
        {images.map((image, index) => (
          <Images key={index} imagePosition={image} imageUrl={image.url} />
        ))}
        <div className="score">{score}</div>
      </div>
      <div className="buttons">
        <button 
          className="arrows"
          onMouseDown={() => handleKeyDown({ key: "ArrowLeft" })} 
          onMouseUp={() => handleKeyUp({ key: "ArrowLeft" })} 
          style={{ backgroundImage: `url(/leftArrow.png)`, backgroundSize: 'cover' }}
        ></button>
        <button 
          className="arrows" 
          onMouseDown={() => handleKeyDown({ key: "ArrowRight" })} 
          onMouseUp={() => handleKeyUp({ key: "ArrowRight" })} 
          style={{ backgroundImage: `url(/rightArrow.png)`, backgroundSize: 'cover' }}
        ></button>
        <div>
          <button 
            className="fire-button" 
            onMouseDown={() => fireCannon()} 
            style={{ backgroundImage: `url(/fireButton.png)`, backgroundSize: 'cover' }}
          ></button>
        </div>
      </div>
    </div>
  );
}