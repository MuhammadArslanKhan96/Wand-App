import "./Sidebar.scss";

import { Drawer } from "@material-ui/core";
import React from "react";

import NavContent from "./NavContent";

type Props = {
  theme: string;
};

const Sidebar: React.FC<Props> = ({ theme }) => (
  <div className="sidebar" id="sidebarContent">
    <Drawer variant="permanent" anchor="left">
      <NavContent theme={theme} />
    </Drawer>
  </div>
);

export default Sidebar;
