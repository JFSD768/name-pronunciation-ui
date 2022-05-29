import React, { useState } from "react";
import '../../App.css';
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PlayButton from "./PlayButton";
import FileUpload from "./FileUpload";

import Recorder from "./Recorder";

import Preferences from "./Preferences";

import Loading from "./Loading";
import { useEffect } from "react";
import { IconButton} from "@material-ui/core";

import { Alert} from "@material-ui/lab";
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import axios from "axios";

function NameTool() {
    const [selectedName, setSelectedName] = useState(null);
    const [empDetails, setEmpDetails] = useState(null);
    const [itemsList, setItemsList] = useState([]);
    
    const [prefPronunciation, setPrefPronunciation] = useState("");
    const [togglePronounce, setTogglePronounce] = useState(false);
    const [audioData, setAudioData] = useState(null);

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecordSuccess, setIsRecordSuccess] = useState(false);
    const [isUpload, setIsUpload] = useState(false);
    
    const [isSavePref, setIsSavePref] = useState(false);
    const alertRef = React.useRef();
    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
    };

    useEffect(() => {
        axios.get("http://wfnps.azurewebsites.net/names").then(response => {
            setItemsList(response.data)
        });
        
    }, [])

    useEffect(() => {
        if (selectedName !== null) setTogglePronounce(true);
    }, [selectedName])

    const onStopSelect = (audioData, isUpload) => {
        setAudioData(audioData);
        setPrefPronunciation(isUpload ? base64toBlob(audioData) : audioData.url);
        isUpload ? setIsUpload(true) : setIsRecordSuccess(true);

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

    const onUserChange = (_event, newVal) => {
        if(newVal && newVal !== "" && newVal.id){
            setIsLoading(true);
        } else return;
        setSelectedName(null);
        setPrefPronunciation("");
        setAudioData(null);
        setSelectedName(newVal);
        axios.get(`https://wfnps.azurewebsites.net/names/${newVal.id}`).then(response => {           
               setPrefPronunciation(base64toBlob(response.data.prefPronunciation));
               setEmpDetails(response.data);
               setIsLoading(false);
           
        });
    }

    const getName = () => {
        if (selectedName) return selectedName.prefName ? selectedName.prefName : `${selectedName.legalFName}, ${selectedName.legalLName}`
        else return "";
    }

    const playPrefName = () => {
        document.getElementById("prefPronunciation").play();   
      
    }

    const onSavePref=() => {
        setIsLoading(true);
        setPrefPronunciation("");
        setAudioData(null);
        axios.get(`https://wfnps.azurewebsites.net/names/${selectedName.id}`).then(response => {           
               setPrefPronunciation(base64toBlob(response.data.prefPronunciation));
               setEmpDetails(response.data);
               setIsLoading(false);
               
               setIsSavePref(true);
           
        });
        
    }

    const handleAlertClose = () => {
        if(isRecordSuccess)setIsRecordSuccess(false);
        else if(isUpload) setIsUpload(false);
        else setIsSavePref(false);
    }
    return (
        <>
            {(itemsList && itemsList.length > 0) ? (<>
                {(isRecordSuccess || isSavePref || isUpload) && (<Alert onClose={handleAlertClose} severity="success">
                    You have successfully {isRecordSuccess ? "recorded your audio" : isUpload ? "uploaded your audio" : "saved your preferences"}
                </Alert>)}
                <div className="tool-body">
                    
                    {/* <div className="tool-header">Name Pronounciation Tool</div> */}

                    <div class="name-search">
                        <Autocomplete
                            options={itemsList}
                            renderInput={params => (
                                <TextField {...params} label="Search by Legal First, Legal Last or Preferred Name" variant="outlined" />
                            )}
                            getOptionSelected={(option, value) => option.uId === selectedName.uId }
                            getOptionLabel={(option) => (`${option.legalLName}, ${option.legalFName}` + (option.prefName !== null ? "(" + option.prefName + ")" : ""))}
                            style={{ width: 500 }}
                            value={selectedName}
                            onChange={onUserChange}
                        />
                    </div>
                    {selectedName !== null && prefPronunciation !== "" && (
                        <>

                            <div className="user-details pronounce-name">
                                <span className="name-audio">Pronunciation of {getName()}</span>
                                <IconButton size="medium" onClick={playPrefName} >
                                    <VolumeUpIcon /> </IconButton>
                                    <audio id="prefPronunciation" className="visually-hidden" src={prefPronunciation} />
                            </div>
                            <div className="user-details">
                                <table>
                                    <tr>
                                        <th>Legal First Name</th>
                                        <th>Legal Last Name</th>
                                        <th>Preferred Name</th>
                                    </tr>
                                    <tr>
                                        <td>{selectedName.legalFName}</td>
                                        <td>{selectedName.legalLName}</td>
                                        <td>{selectedName.prefName}</td>
                                        
                                    </tr>
                                </table>
                            </div>
                            {(sessionStorage.getItem("username") && (sessionStorage.getItem("username").toLowerCase() === "admin"|| sessionStorage.getItem("username").toLowerCase() === selectedName.uId) && empDetails !== null) && (
                            <div className="name-customize-tools" style={{ marginTop: 50 }}>

                                <Preferences userDetails={empDetails} onSavePref={onSavePref}/>
                                <Recorder userDetails={selectedName} onStopSelect={onStopSelect} />
                                <FileUpload userDetails={selectedName} onStopSelect={onStopSelect} />



                            </div>
                            )}
                        </>
                    )}
                    {isLoading && (<Loading />)}
                </div>
                </>) : <Loading />}</>
    );
}

export default NameTool;
