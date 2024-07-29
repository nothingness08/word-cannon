import React from "react";

function Cannon({cannonPos, word}){
    return (
      <div>
        <img
          src={"/Cannon.png"}
          alt="Cannon"
          className="cannon"
          style={{
            left: cannonPos.x,
            top: cannonPos.y,
          }}
          draggable={true}
        />
        <div 
          //className="correct-Word"
          style={{
            top: cannonPos.y + 90,
            left: cannonPos.x + 45,
            position: 'absolute',
          }}
        >{word}</div>

      </div>
    );
      
  }

  export default Cannon;