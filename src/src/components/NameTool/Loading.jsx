import React from "react";

import { CircularProgress, Backdrop } from '@material-ui/core';

function Loading(zIndex) {
    return (
        <div>
            <Backdrop
                className={zIndex? "add-zindex" : ""}
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
            >
                <div> Loading...  </div>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>);
}

export default Loading;