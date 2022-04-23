/* eslint-disable */
import "./Sidebar.scss";

import { Box } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

type NavItemProps = {
  Label: string;
  SvgIcon: any;
  to: string;
  styles: object;
  isExternal: boolean;
};

const NavItems: React.FC<NavItemProps> = ({ styles, to, SvgIcon, Label, isExternal }) => {
  return (
    <Box className="custom-nav-item" display="flex" justifyContent="space-between" flexDirection="column">
      <Link to={!isExternal && to} onClick={() => isExternal && window.open(to)}>
        <SvgIcon style={{ height: 20, width: 20 }} />
        <label style={styles}> {Label} </label>
      </Link>
    </Box>
  );
};

export default NavItems;
