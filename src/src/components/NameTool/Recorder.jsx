

import React, { useEffect, useState } from "react";

import AudioReactRecorder, { RecordState } from 'audio-react-recorder';

import Button from "@material-ui/core/Button";
import AdjustIcon from "@material-ui/icons/Adjust";
import MicOutlinedIcon from '@material-ui/icons/MicOutlined';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/Close';

import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import PlayButton from "./PlayButton";
import axios from "axios";

function Recorder({ userDetails, onStopSelect }) {
    const [recordState, setRecordState] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const [base64Audio, setBase64Audio] = useState("");
    const [openPanel, setOpenPanel] = useState(false);

    const [openInfoPanel, setOpenInfoPanel] = useState(false);

    useEffect(() => {
        if (recordState === "start") {
            setTimeout(() => {
                if (recordState !== 'stop') stop();
            }, 6000);
        }

    }, [recordState])

    const start = () => {
        setRecordState(RecordState.START)

    }

    const stop = () => {
        setRecordState(RecordState.STOP)
    }

    //audioData contains blob and blobUrl
    const onStop = (audioData) => {
        setAudioData(audioData);
    }

    const handleRecordClick = () => {
        setOpenPanel(true);
    }



    const cancelAudio = () => {
        //Do axios call 
        // console.log("recordState", audioData.url);
        setRecordState(null);
        setAudioData(null);

    }
    const handleClose = () => {

        cancelAudio();
        setOpenPanel(false);
    }

    const blobToBase64 = blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise(resolve => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };

    const saveAudio = () => {
        //Do axios call 
        // console.log("recordState", audioData.url);
        blobToBase64(audioData.blob).then((resp) => setBase64Audio(resp.split("base64,")[1]));
        setOpenInfoPanel(true);
        setOpenPanel(false);
    }



    const handleYes = () => {

        onStopSelect(audioData);
        if (base64Audio !== "") axios.put(`https://wfnps.azurewebsites.net/names/${userDetails.id}`, { ...userDetails, prefPronunciation: base64Audio })
        setRecordState(null);
        setAudioData(null);
        setOpenInfoPanel(false);


    }

    const handleNo = () => {
        setRecordState(null);
        setAudioData(null);
        setOpenInfoPanel(false);
    }

    const handleInfoClose = () => {
        setOpenInfoPanel(false);
    }

    const getName = () => {
        if (userDetails) return userDetails.prefName ? userDetails.prefName : `${userDetails.legalFName}, ${userDetails.legalLName}`
        else return "";
    }

    return (<div>
        <Button variant="contained" size="medium" onClick={handleRecordClick} startIcon={<AdjustIcon />}>Record {getName()}</Button>
        <Dialog onClose={handleClose} aria-labelled-by="customized-dialog-title" open={openPanel}>
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                Record {getName()}
                <IconButton className="float-right" onClick={handleClose} >
                    <CloseIcon /> </IconButton>
            </DialogTitle>
            <DialogContent>
                {!(audioData && audioData.url) ? (<>

                    {(recordState === null || recordState !== "start") && (<>

                        <div> Go to a quiet place and the click on the record button </div>
                        <div className="mic-icon"><IconButton size="medium" onClick={start} >
                            <MicOutlinedIcon fontSize="medium" /> </IconButton>
                        </div>

                        <div className="mic-icon-info">Click the button to start recording</div></>)}
                    <AudioReactRecorder state={recordState} onStop={onStop} />
                    {recordState === "start" && (<div className="stop-icon"><IconButton size="medium" onClick={stop} >
                        <StopIcon fontSize="medium" /> </IconButton></div>)}</>)


                    : (
                        <>
                            {audioData && audioData.url && (<PlayButton name="play-audio" url={audioData.url} />)}
                            <Button variant="outlined" onClick={saveAudio} className="save-audio"> Save </Button>
                            <Button variant="outlined" onClick={cancelAudio} className="cancel-audio"> Cancel </Button>
                        </>
                    )}

            </DialogContent>
        </Dialog>

        <Dialog onClose={handleInfoClose} aria-labelled-by="customized-dialog-title" open={openInfoPanel}>
            <DialogTitle id="customized-dialog-title" onClose={handleInfoClose}>
                Verification
                <IconButton className="float-right" onClick={() => setOpenInfoPanel(false)} >
                    <CloseIcon /> </IconButton>
            </DialogTitle>
            <DialogContent>
                This will override your existing pronunciation. Do you want to proceed?
                <div className="user-details margin-top-50 margin-bottom-20">
                    <Button variant="outlined" onClick={handleYes} className="save-audio"> Yes </Button>
                    <Button variant="outlined" onClick={handleNo} className="cancel-audio"> No </Button>
                </div>

            </DialogContent>
        </Dialog>

    </div>
    )
}
export default Recorder;
