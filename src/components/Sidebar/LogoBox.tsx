/* eslint-disable */
import "./Sidebar.scss";

import { Box } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

type LogoBoxProps = {
    SvgIcon: any;
    to: string;
};

const LogoBox: React.FC<LogoBoxProps> = ({ to, SvgIcon }) => {
    return (
        <div>
            <Link to={to}>
                <SvgIcon
                    style={{ width: "155px", height: "136px"}}
                />
            </Link>
        </div>
    );
};

export default LogoBox;
