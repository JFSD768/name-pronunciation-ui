import React, { useState, useEffect } from "react";
//  import useAudio from "./useAudio";


function PlayButton({url, name}){
    // const [playing, toggle] = useAudio(url);
    return (
        <div className={name ? name : ""}>
            <audio src={url} controls />
            {name  && (<div className="mic-icon-info"> Click the play button to listen to the recorded audio</div>)}
            {/* <button onClick={toggle}>{playing? `Pause`: `Play ${name}`}</button> */}
        </div>
    )
}

export default PlayButton;