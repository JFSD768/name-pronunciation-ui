

import React, { useState } from "react";

import CloseIcon from '@material-ui/icons/Close';

import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { Slider, Box, InputLabel, MenuItem, FormControl, Select, Dialog, DialogTitle, DialogContent, IconButton, Button } from '@material-ui/core';


import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Loading from "./Loading";
import axios from "axios";
import languages from "../../constants/languages.json";


function Preferences(props) {

    const convertToPercentile = speed => {
        return (Number(speed) * 100) - 100
    }

    const convertToDecimals = (speed) => (Number(speed) + 100) / 100;
    
    const baseUrl = "https://wfnps.azurewebsites.net";

    const { onSavePref } = props;

    const { prefName, legalFName, legalLName, id, prefVoice, prefLanguage, prefSpeakingSpeed, prefPronunciation } = props.userDetails;

    const [openPanel, setOpenPanel] = useState(false);


    const [isLoading, setIsLoading] = useState(false);
    const [chosenLanguage, setChosenLanguage] = useState(prefLanguage !== null ? prefLanguage : "");
    const [voiceList, setVoiceList] = useState([]);
    const [chosenVoice, setChosenVoice] = useState(prefVoice !== null ? prefVoice : "");


    const [chosenSpeed, setChosenSpeed] = useState(prefSpeakingSpeed !== null ? prefSpeakingSpeed : "0");

    const [chosenPronounciation, setChosenPronounciation] = useState(prefPronunciation);

    const [langVal, setLangVal] = useState("");
    const [speedValue, setSpeedValue] = useState(prefVoice !== null ? convertToDecimals(prefVoice) : "");



    const getLanguage = (lang) => {
        const index = Object.values(languages).indexOf(lang);
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
        axios.get(`${baseUrl}/voices/${event.target.value}`).then(response => {
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
        setChosenVoice("");
        setVoiceList([]);
        setLangVal(prefLanguage !== null ? prefLanguage : "");
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
        if (prefVoice === chosenVoice && prefLanguage === chosenLanguage && prefSpeakingSpeed === chosenSpeed) {
            setOpenPanel(false);
        } else {
            axios.put(`${baseUrl}/namesPref/${id}`, { prefVoice: chosenVoice, prefLanguage: chosenLanguage, prefSpeakingSpeed: `${chosenSpeed}` }).then(() => {
                onSavePref();
            })
            setOpenPanel(false);
        }
    }

    function base64toBlob(base64Data) {
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        const blob = new Blob(byteArrays, { type: "audio/wav" });

        return URL.createObjectURL(blob);
    }




    const playAudio = () => {
        if (prefVoice === chosenVoice && prefLanguage === chosenLanguage && prefSpeakingSpeed === chosenSpeed) {
            document.getElementById("playPrefAudio").play();
        } else {
            setIsLoading(true);
            setChosenPronounciation("");
            axios.get(`${baseUrl}/voices/${getName()}/${chosenLanguage}/${chosenVoice}/${chosenSpeed}`).then(response => {

                setChosenPronounciation(response.data.prefPronunciation);
                setIsLoading(false);
                setTimeout(() => {
                    document.getElementById("playPrefAudio").play();
                }, 0)
            });

        }
    }



    return (
        <>
            {isLoading && <Loading zIndex />}
            <Button variant="contained" size="medium" onClick={openSettings} startIcon={<SettingsOutlinedIcon />}>Preferences</Button>

            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={openPanel}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Preferences
                    <IconButton className="float-right" onClick={handleClose}>
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
                                        <td>{getLanguage(chosenLanguage !== "" ? chosenLanguage : prefLanguage)}</td>
                                        <td>{chosenVoice !== "" ? chosenVoice : prefVoice}</td>
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
