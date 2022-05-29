import React, { useEffect, useState } from "react";


import '../../App.css';

import Button from "@material-ui/core/Button";

import { Typography, TextField, Grid, Paper } from "@material-ui/core";
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");



    const handleSubmit = () => {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("id", password);
        navigate("/nametool");
    }

    return (
        <>
            <div>
                <Grid container spacing={0} justify="center" direction="row">

                    <Grid item>
                        <Grid container direction="column" justify="center" className="login-form">
                            <Typography align="center" component="h1" variant="h5">
                                Name Pronunciation Tool
                            </Typography>
                            <Paper varaiant="elevation" elevation={3} className="login-wrapper">
                                <Grid item>
                                    <form onSubmit={handleSubmit} noValidate>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <TextField id="outlined-basic" size="small" label="User Name" variant="outlined" autoComplete="off" name="username" onChange={({ target }) => setUsername(target.value)}
                                                    inputProps={{ maxLength: 7 }} />

                                            </Grid>
                                            <Grid item>
                                                <TextField id="outlined-password-input" size="small" label="Password" type="password" variant="outlined" autoComplete="off" name="password" onChange={({ target }) => setPassword(target.value)}
                                                    inputProps={{ maxLength: 16 }} />

                                            </Grid>

                                            <Grid item>
                                                <Button variant="contained" type="submit" className="button-block">Sign in</Button>

                                            </Grid>



                                        </Grid>
                                    </form>
                                </Grid>
                            </Paper>
                        </Grid>

                    </Grid>
                </Grid>
            </div>
        </>

    );
}

export default Login;
