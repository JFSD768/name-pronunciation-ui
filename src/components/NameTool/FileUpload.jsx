import React, { useState } from "react";

import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";

import { Dialog, DialogTitle, DialogContent, IconButton, Button } from "@material-ui/core";

import CloseIcon from '@material-ui/icons/Close';
import axios from "axios";

export default function FileUpload({ userDetails, onStopSelect }) {
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
        <Button variant="contained" className="uploadIcon" component="span" size="span" startIcon={<ArrowUpwardOutlinedIcon fontSize="small" />} onClick={() => fileRef.current.click()}>
          <input accept="audio/*" id="contained-button-file" name="upload" type="file" ref={fileRef} hidden
            onChange={handleChange} />
          Upload File
        </Button>
      </div>

      <Dialog onClose={handleInfoClose} aria-labelledby="customized-dialog-title" open={openInfoPanel}>
        <DialogTitle id="customized-dialog-title" onClose={handleInfoClose}>
          Verification
          <IconButton className="float-right" onClick={() => setOpenInfoPanel(false)} >
            <CloseIcon /> </IconButton>
        </DialogTitle>
        <DialogContent>
          {file && file !== undefined && file !== null && (<><b>{file.name}</b> will override your existing pronunciation. Do you want to proceed?</>)}
          <div className="user-details margin-top-50 margin-bottom-20">
            <Button variant="outlined" onClick={handleYes} className="save-audio"> Yes </Button>
            <Button variant="outlined" onClick={handleNo} className="cancel-audio"> No </Button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );


}