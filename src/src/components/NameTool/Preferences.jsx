

import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";

import CloseIcon from '@material-ui/icons/Close';

import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';

import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select, { SelectChangeEvent } from '@material-ui/core/Select';


import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Loading from "./Loading";
import Slider from '@material-ui/core/Slider';
import axios from "axios";
import languages from "./languages.json";


function Preferences(props) {
    
    const convertToPercentile = speed => {
       return (Number(speed)*100) - 100
    }


    const convertToDecimals = (speed) => (Number(speed)+100)/100;
    const {onSavePref} = props;
    
    const {prefName, legalFName, legalLName, id, prefVoice, prefLanguage, prefSpeakingSpeed, prefPronunciation} = props.userDetails;

    const [openPanel, setOpenPanel] = useState(false);


    const [isLoading, setIsLoading] = useState(false);
    const [chosenLanguage, setChosenLanguage] = useState(prefLanguage !== null ? prefLanguage : "");
    const [voiceList, setVoiceList] = useState([]);
    const [chosenVoice, setChosenVoice] = useState(prefVoice !== null ? prefVoice : "");


    const [chosenSpeed, setChosenSpeed] = useState(prefSpeakingSpeed !== null ? prefSpeakingSpeed : "0");

    const [chosenPronounciation, setChosenPronounciation] = useState(prefPronunciation);
    
    const [langVal, setLangVal] = useState("");
    const [speedValue, setSpeedValue] = useState(prefVoice !== null ? convertToDecimals(prefVoice) : "");

    

    const getLanguage = (lang)=>{
        const index = Object.values(languages).indexOf(chosenLanguage);
        return Object.keys(languages)[index];
    }

    const valueText = (value) => {
        setChosenSpeed(convertToPercentile(value));
        setSpeedValue(value);
        return value;
    }

    const handleChange = (event) => {
        setIsLoading(true);
        setLangVal(event.target.value);
        setChosenLanguage(event.target.value);
        axios.get(`http://wfnps.azurewebsites.net/voices/${event.target.value}`).then(response => {
            setVoiceList(response.data);
            setChosenVoice(response.data[0].shortName.split("-")[2]);
            
        setIsLoading(false);
        });
    };

    const handleVoiceChange = (event) => {
        setChosenVoice(event.target.value);
    };

    const openSettings = () => {
        setOpenPanel(true);
    }
    const setDefaults = () => {
        
        setChosenVoice(prefVoice !== null ? prefVoice : "" );
        setChosenLanguage(prefLanguage !== null ? prefLanguage : "");
        setChosenSpeed(prefSpeakingSpeed !== null ? prefSpeakingSpeed : "0");
    }

    const handleClose = () => {
        setDefaults();
        setOpenPanel(false);
    }

    const cancelPreferences = () => {
        handleClose();
    }

    const getName = () => {
        return prefName ? prefName : `${legalFName} ${legalLName}`
    }

    const savePreferences = () => {
        //make axios
        if(prefVoice === chosenVoice && prefLanguage === chosenLanguage && prefSpeakingSpeed === chosenSpeed){            
            setOpenPanel(false);
        } else {
           axios.put(`https://wfnps.azurewebsites.net/namesPref/${id}`, { prefVoice: chosenVoice, prefLanguage: chosenLanguage, prefSpeakingSpeed: `${chosenSpeed}` }).then(()=>{
               onSavePref();
           })
           setOpenPanel(false);
        }
    }

    function base64toBlob(base64Data) {
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);
    
        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);
    
            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        const blob = new Blob(byteArrays, { type: "audio/wav" });

        return URL.createObjectURL(blob);
    } 

    


    const playAudio = () => {
        if(prefVoice === chosenVoice && prefLanguage === chosenLanguage && prefSpeakingSpeed === chosenSpeed){            
          document.getElementById("playPrefAudio").play();   
        } else {
            setIsLoading(true);
            setChosenPronounciation("");
            axios.get(`https://wfnps.azurewebsites.net/voices/${getName()}/${chosenLanguage}/${chosenVoice}/${chosenSpeed}`).then(response => {
                 
            setChosenPronounciation(response.data.prefPronunciation);
               setIsLoading(false);
               setTimeout(()=> {
                document.getElementById("playPrefAudio").play();
               },0)
           });

        }
    }



    return (
        <>
            {isLoading && <Loading zIndex/>}
            <Button variant="contained" size="medium" onClick={openSettings} startIcon={<SettingsOutlinedIcon />}>Preferences</Button>
            
            <Dialog onClose={handleClose} aria-labelled-by="customized-dialog-title" open={openPanel}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Preferences
                    <IconButton className="float-right" onClick={() => setOpenPanel(false)} >
                        <CloseIcon /> </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div> Select a language and voice in which you would like to listen the pronunciation in</div>
                    {prefLanguage !== null && prefSpeakingSpeed !== null && prefVoice !== null && (
                    <>
                    <div className="user-details user-pref">
                                <table>
                                    <caption>User Preferences</caption>
                                    <tr>
                                        <th>Language</th>
                                        <th>Voice</th>
                                        <th>Speaking Speed</th>
                                    </tr>
                                    <tr>
                                        <td>{getLanguage(chosenLanguage)}</td>
                                        <td>{chosenVoice}</td>
                                        <td>{speedValue}</td>
                                        
                                    </tr>
                                </table>
                            </div>
                            </>)}
                    <div className="user-details margin-top-30 margin-bottom-30 justify-content--space-around">
                        <Box sx={{ minWidth: 250 }} className="margin-right-50">
                            <FormControl fullWidth>

                                <InputLabel id="language-select-label">Language</InputLabel>
                                
                                <Select
                                    id="language-select"
                                    value={langVal}
                                    label="Language"
                                    onChange={handleChange}
                                >
                                    {Object.keys(languages).map((lang) => {
                                    return <MenuItem value={languages[lang]}>{lang}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>
                        </Box>
                        {voiceList && voiceList.length > 0 && (
                            <Box sx={{ minWidth: 130 }}>
                                <FormControl fullWidth>

                                    <InputLabel id="voice-select-label">Voice</InputLabel>
                                    <Select
                                        labelId="voice-select-label"
                                        id="voice-select"
                                        value={chosenVoice}
                                        label="Voice"
                                        onChange={handleVoiceChange}
                                    >
                                        {voiceList.map((voice) => {
                                           return <MenuItem value={voice.shortName.split("-")[2]}>{voice.localName}</MenuItem>
                                        })}
                                    </Select>

                                </FormControl>
                            </Box>


                        )}
                    </div>
                    <div className="float-left  margin-left-25 margin-btm-10">Speaking Speed:</div>
                    <div className="user-details slider-width">

                        <Slider
                            aria-label="Speaking Speed"
                            defaultValue={convertToDecimals(chosenSpeed)}
                            getAriaValueText={valueText}
                            valueLabelDisplay="auto"
                            step={0.01}
                            min={0.00}
                            max={3.00}
                        />

                    </div>
                    <div className="user-details margin-bottom-20">
                        <Button variant="contained" size="medium" onClick={playAudio} disabled={chosenLanguage === "" && chosenVoice === ""} startIcon={<PlayCircleFilledIcon />}>Play
                          <audio id="playPrefAudio" className="visually-hidden" src={base64toBlob(chosenPronounciation)} />
                        </Button>
                        <Button variant="filled" onClick={savePreferences} disabled={chosenLanguage === "" && chosenVoice === ""} className="save-audio"> Save </Button>
                        <Button variant="filled" onClick={cancelPreferences} className="cancel-audio"> Cancel </Button>
                    </div>

                </DialogContent>
            </Dialog>

           
        </>

    );
}

export default Preferences;
