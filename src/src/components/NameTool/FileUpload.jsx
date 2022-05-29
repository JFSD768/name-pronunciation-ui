import React, { useState } from "react";

import Button from "@material-ui/core/Button";
import { styled } from "@material-ui/styles";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

import CloseIcon from '@material-ui/icons/Close';

import IconButton from "@material-ui/core/IconButton";
import axios from "axios";

const Input = styled('input')({
  display: "none"
});

export default function FileUpload({userDetails, onStopSelect}) {
  const fileRef = React.useRef();
  let [file, setFile] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  
  const [openInfoPanel, setOpenInfoPanel] = useState(false);
  
  async function audioToBase64(audioFile) {
    const response = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(audioFile);
    });
    setUploadedAudio(response.split("base64,")[1]);
  }

  const handleChange = (event) => {
    setFile(event.target.files[0]);
    audioToBase64(event.target.files[0]);
    setOpenInfoPanel(true);
  };


  const handleInfoClose = () => {
    setOpenInfoPanel(false);
  }


const uploadAudio = () => {
  document.getElementById("contained-button-file").click();
}

const handleYes = () => {
  if (uploadedAudio !== "") axios.put(`https://wfnps.azurewebsites.net/names/${userDetails.id}`, { ...userDetails, prefPronunciation: uploadedAudio })
  onStopSelect(uploadedAudio, "upload");
  handleInfoClose();
}

const handleNo = () => {
  setFile(null);
  setUploadedAudio(null);
   handleInfoClose();
 }

  return (
    <>
    <div>
      <label htmlFor="contained-button-file">
      <Input accept="audio/*" id="contained-button-file" type="file" ref={fileRef} onChange={handleChange} />
      <Button variant="contained" className="uploadIcon" component="span" size="span" startIcon={<ArrowUpwardOutlinedIcon fontSize="small"/>} onClick={uploadAudio}> Upload Audio </Button>
      </label>

      {/* <button onClick={() => fileRef.current.click()}>
        <input id="upload" name="upload" type="file" ref={fileRef} hidden
          onChange={handleChange} />
        Upload File
      </button>
      { file &&  file!==undefined && file!==null &&
        <div>
          <p>{file.name}</p>
          <p>{file.size}</p>
          <p>{file.type}</p>
        </div>
      }   */}
    </div>

<Dialog onClose={handleInfoClose} aria-labelled-by="customized-dialog-title" open={openInfoPanel}>
<DialogTitle id="customized-dialog-title" onClose={handleInfoClose}>
    Verification
    <IconButton className="float-right" onClick={() => setOpenInfoPanel(false)} >
        <CloseIcon /> </IconButton>
</DialogTitle>
<DialogContent>
  {file && file!== undefined && file !== null && (<><b>{file.name}</b> will override your existing pronunciation. Do you want to proceed?</>)}
    <div className="user-details margin-top-50 margin-bottom-20">
        <Button variant="outlined" onClick={handleYes} className="save-audio"> Yes </Button>
        <Button variant="outlined" onClick={handleNo} className="cancel-audio"> No </Button>
    </div>

</DialogContent>
</Dialog>
</>
  );


}