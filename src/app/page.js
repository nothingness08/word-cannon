"use client"
import "./globals.css";
import React, { useState, useEffect, useCallback } from 'react';
import Balls from "./Balls";
import Cannon from "./Cannon";
import Images from "./Images";

function randomInt(max) { //[0, max] inclusive
  return Math.floor(Math.random() * (max+1));
}

function randomWord(correctWord) {
  const words = ["ring", "drink", "fang", "king", "strong", "swing", "stung", "stink", "bank", "junk", "pink", "wing"]; //words could be imported
  //chance that correct image will spawn, formula is complicated, but correct
  const probability = 0.33;
  let additionalCorrectWords = Math.floor(((probability*words.length) -1)/(1-probability));//rounded down

  if (correctWord) { //if correct word is passed in, make the words weighted
    const weightedWords = [...Array(additionalCorrectWords).fill(correctWord), ...words]; 
    return weightedWords[randomInt(weightedWords.length -1)];
    //probability of correct word chosen is (additional+1)/(additional + words.length)
    //probability of other word chosen is 1/(additional + words.length)
  } 
  return words[randomInt(words.length - 1)]; //return random word
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
    if(gameStarted){ //word to find is set to random, not weighted
      setCorrectWord(randomWord(null));
    }
    //make balls go up and delete balls offscreen, any numbers can be tweeked easily
	  const ballsMove = setInterval(() => {
	    if(!gameOver && gameStarted){
        setBalls((prev) =>
          prev
          .map((ball) => ({ ...ball, y: ball.y - 8 }))
          .filter((ball) => ball.y > -20)
        );
      }
	  }, 20);
    //make images go down and delete images offscreen
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
  }, [gameOver, gameStarted]); //if game state changes, things stop moving

  useEffect(() => {
	  const cannonMove = setInterval(() => {
      const canMoveRight = cannonPos.x <= 478; //bound movement within screen, will have to be changed if cannon image is changed
      const canMoveLeft = cannonPos.x >= 0;
      //move based on last input and what key is pressed
      //I worked for a while to get the movement right with arrows keys, but it doesn't really matter with the buttons
      //with arrow keys, if left is held down and then right is held down, it will move right, and then if right is released, it will move left
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
    //add images with random position and random weighted word 
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
  //create new ball at cannon position, but changed a little to make it look like it is coming from center top
  //if cannon image is changed, this will have to be modified
  const fireCannon = useCallback(() => {
    if(canFire){
      setBalls((prev) => [
        ...prev,
        { x: cannonPos.x + 55, y: cannonPos.y - 8 },
      ]);
      setCanFire(false);
    }
  }, [cannonPos, canFire]);

  //make it so that you cant spam firing cannon every frame, currently reload is set to every 0.4 sec
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

		balls.forEach((ball, ballIndex) => { //called for each ball in balls array
      //find cords of ball
			const ballTop = ball.y;
			const ballBottom = ball.y + 20; 
			const ballLeft = ball.x;
			const ballRight = ball.x + 20;
      images.forEach((image, imageIndex) => { //called for each image in images array
        //find cords of images
        const imageTop = image.y;
			  const imageBottom = image.y + 40;
			  const imageLeft = image.x;
			  const imageRight = image.x + 40;
        
        //check for collisions, remember that cord system begins from top left
        const isColliding = 
        ballTop < imageBottom && 
        ballBottom > imageTop &&
        ballLeft < imageRight &&
        ballRight > imageLeft;
        if(isColliding){
          if (image.word === correctWord) { //if the correct image was hit
            setScore((prevScore) => prevScore + 1);
            setCorrectWord(randomWord(null)); //new un-weighted word
          }
          else{ //end the game
            setGameOver(true);
          }
          //I am still not very comfortable with javascript functions such as .filter .map and .some
          //so this might not be the most efficient
          //get rid of balls and images that collided
          updatedBalls = updatedBalls.filter((_, idx) => idx !== ballIndex);
          updatedImages = updatedImages.filter((_, idx) => idx !== imageIndex);
        }
      })
		});
    //update balls and images now that collisions have been removed
    setBalls(updatedBalls);
    setImages(updatedImages);
	};

  useEffect(() => { //every time balls changes, 0.02 sec, check for collisions, i guess that means that it runs at 50fps
    checkCollision();
  }, [balls, gameOver]);

  const handleKeyDown = useCallback((event) => { //used for buttons and for arrow keys
    const newDirection = event.key.replace("Arrow", ""); //events are passed in as ArrowLeft/ArrowRight, so this shortens them
    if (["Left", "Right"].includes(newDirection)) {  //if the left or right was passed in
      setKeysPressed((prev) => ({...prev, [newDirection]: true})); //sets the pressed key to true
      setLastPressed(newDirection);
    }
    if(event.key === " "){ //if space was passed in, call fireCannon
      fireCannon();
    }
    if(!gameStarted || gameOver){ //if the game is stopped, start it again, probably should be function
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setImages([]);
      setCannonPos({x: 240, y: 480});
    }
  }, [fireCannon, gameOver]);

  const handleKeyUp = useCallback((event) => { //track key/button ups because of weird movement things
    const newDirection = event.key.replace("Arrow", "");
    if (["Left", "Right"].includes(newDirection)) {
      setKeysPressed((prev) => ({ ...prev, [newDirection]: false }));
    }
  }, []);


  useEffect(() => { //idk what this does, but it works
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
        <Cannon cannonPos={cannonPos} word={correctWord} /> {/* render cannon*/}
        {/* render balls*/}
        {balls.map((ball, index) => (                       
          <Balls key={index} ballPosition={ball} />
        ))}
        {/* render images*/}
        {images.map((image, index) => (
          <Images key={index} imagePosition={image} imageUrl={image.url} />
        ))}
        {/* render score*/}
        <div className="score">{score}</div>
      </div>
      {/* render buttons, this could probably be cleaned up and more efficient*/}
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