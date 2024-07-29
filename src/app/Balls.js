import React from "react";
 
const Balls = ({ ballPosition}) => {
    return (
        <img
            src={'/Ball.png'}
            alt="ball"
            className="ball"
            style={{
                left: ballPosition.x,
                top: ballPosition.y,
            }}
            draggable={true}
        />
    );
};
 
export default Balls;