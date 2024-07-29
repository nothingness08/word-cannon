import React from "react";
 
const Images = ({ imagePosition, imageUrl }) => {
    return (
        <img
            src={imageUrl}
            alt="image"
            className="image"
            style={{
                left: imagePosition.x,
                top: imagePosition.y,
            }}
            draggable={true}
        />
    );
};
 
export default Images;