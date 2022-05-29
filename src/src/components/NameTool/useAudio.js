import React, { useState, useEffect } from "react";

function useAudio(url){
    const [audio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(true);
    const toggle = () => setPlaying(!playing);

    useEffect(() => {
      playing ? audio.play() : audio.pause();
    }, [playing]);

    useEffect(() => {
        audio.addEventListener("ended", () => setPlaying(false));
        return () => audio.removeEventListener("ended", () => setPlaying(false));
    },[]);
    return [playing, toggle];
}


export default useAudio;