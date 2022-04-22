/* eslint-disable */
import "./Sidebar.scss";

import { t, Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Link,
  Paper,
  SvgIcon,
  Typography,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
// import { NavItem } from "@olympusdao/component-library";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { NetworkId } from "src/constants";
import { EnvHelper } from "src/helpers/Environment";
import { useAppSelector } from "src/hooks";
import { useWeb3Context } from "src/hooks/web3Context";
import { Bond } from "src/lib/Bond";
import { IBondDetails } from "src/slices/BondSlice";
import { getAllBonds, getUserNotes } from "src/slices/BondSliceV2";
import { DisplayBondDiscount } from "src/views/BondV2/BondV2";

import { ReactComponent as OkapiIcon } from "../../assets/icons/okapi-nav-header.svg";
import { ReactComponent as OkapiIconLight } from "../../assets/icons/okapi-nav-headerLight.svg";
import { ReactComponent as Stake } from "src/assets/icons/Stake.svg";
import { ReactComponent as StakeLight } from "src/assets/icons/StakeLight.svg";
import { ReactComponent as Bridge } from "../../assets/icons/Bridge.svg";
import { ReactComponent as BridgeLight } from "../../assets/icons/Bridge-light.svg";
import { ReactComponent as Wrap } from "../../assets/icons/Wrap.svg";
import { ReactComponent as WrapLight } from "../../assets/icons/Wrap-light.svg";
import { ReactComponent as Governance } from "../../assets/icons/Governance.svg";
import { ReactComponent as GovernanceLight } from "../../assets/icons/Governance-light.svg";
import { ReactComponent as Forum } from "../../assets/icons/Forum.svg";
import { ReactComponent as ForumLight } from "../../assets/icons/Forum-light.svg";
import { ReactComponent as Docs } from "../../assets/icons/Docs.svg";
import { ReactComponent as DocsLight } from "../../assets/icons/Docs-light.svg";
import { ReactComponent as Ido } from "../../assets/icons/ido.svg";
import { ReactComponent as IdoLight } from "../../assets/icons/idoLight.svg";
import { ReactComponent as MyNft } from "../../assets/icons/MyNft.svg";
import { ReactComponent as MyNftLight } from "../../assets/icons/MyNftLight.svg";
import useBonds from "../../hooks/Bonds";
import WalletAddressEns from "../TopBar/Wallet/WalletAddressEns";
import externalUrls from "./externalUrls";
import Social from "./Social";
import NavItems from "./NavItems";
import LogoBox from "./LogoBox";
// import { NavItem } from "@olympusdao/component-library";

type NavContentProps = {
  handleDrawerToggle?: () => void;
  theme: string | undefined
};

type CustomBond = Bond & Partial<IBondDetails>;

const NavContent: React.FC<NavContentProps> = ({ handleDrawerToggle, theme }) => {
  const { networkId, address, provider } = useWeb3Context();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { bonds } = useBonds(networkId);
  const location = useLocation();
  const dispatch = useDispatch();

  const bondsV2 = useAppSelector(state => state.bondingV2.indexes.map(index => state.bondingV2.bonds[index]));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && handleDrawerToggle) {
      handleDrawerToggle();
    }
  }, [location]);

  useEffect(() => {
    const interval = setTimeout(() => {
      dispatch(getAllBonds({ address, networkID: networkId, provider }));
      // dispatch(getUserNotes({ address, networkID: networkId, provider }));
    }, 60000);
    return () => clearTimeout(interval);
  });

  const sortedBonds = bondsV2
    .filter(bond => bond.soldOut === false)
    .sort((a, b) => {
      return a.discount > b.discount ? -1 : b.discount > a.discount ? 1 : 0;
    });

  bonds.sort((a: CustomBond, b: CustomBond) => b.bondDiscount! - a.bondDiscount!);
  return (
    <Paper className="dapp-sidebar">
      <Box className="dapp-sidebar-inner" display="flex" justifyContent="space-between" flexDirection="column">
        <div className="dapp-menu-top">
          {/* <Box className="branding-header">
            <Link href="https://app.okapi.money" target="_blank">
              <LogoBox to="/" SvgIcon={theme === 'light' ? OkapiIcon : OkapiIconLight} />
            </Link>
            <WalletAddressEns />
          </Box> */}
          <div className="dapp-menu-links">
            <div className="dapp-nav" id="navbarNav">
              {
              networkId === NetworkId.BINANCE_TESTNET ||
              networkId === NetworkId.BINANCE
              ? (
                <>
                  <NavItems 
                  styles={{color: theme === 'light' ? '#000' : '#fff'} } 
                  to="/dashboard" 
                  SvgIcon={theme === 'light' ? Stake : StakeLight} 
                  Label="Dashboard" 
                  isExternal={false} />

                  <NavItems 
                  styles={{color: theme === 'light' ? '#000' : '#fff'} } 
                  to="/dashboard" 
                  SvgIcon={theme === 'light' ? Stake : StakeLight} 
                  Label="Swap" 
                  isExternal={false} />
                  {/*<NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="/wrap" SvgIcon={theme === 'light' ? Wrap : WrapLight} Label="Wrap" /> isExternal={false}*/}
                  {/* <NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="/ido-whitelist" SvgIcon={theme === 'light' ? Ido: IdoLight} Label="IDO" isExternal={false} /> */}
                  {/* <NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="https://pancakeswap.finance/swap" SvgIcon={theme === 'light' ? Bridge : BridgeLight} Label="Bridge" isExternal={true} /> */}
                  <Box className="menu-divider">
                    <Divider />
                  </Box>
                  {/* <NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="https://t.me/okapidao_chat" SvgIcon={theme === 'light' ? Forum : ForumLight} Label="Forum" isExternal={true} />
                  <NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="https://t.me/okapidao" SvgIcon={theme === 'light' ? Governance: GovernanceLight} Label="Governance" isExternal={true} />
                  <NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="https://docs.okapi.money/" SvgIcon={theme === 'light' ? Docs: DocsLight} Label="Docs" isExternal={true} /> */}
                  {/*<Box className="menu-divider">*/}
                  {/*  <Divider />*/}
                  {/*</Box>*/}
                  {/*<NavItems styles={{color: theme === 'light' ? '#000' : '#fff'} } to="/MyNft" SvgIcon={theme === 'light' ? MyNft: MyNftLight} Label="My NFT" isExternal={false} />*/}
                  {/* <div className="dapp-menu-data discounts">
                    <div className="bond-discounts">
                      <Accordion className="discounts-accordion" square defaultExpanded={true}>
                        <AccordionSummary
                          expandIcon={
                            <ExpandMore className="discounts-expand" style={{ width: "18px", height: "18px" }} />
                          }
                        >
                          <Typography variant="body2">
                            <Trans>Highest ROI</Trans>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {sortedBonds.map((bond, i) => {
                            return (
                              <Link
                                component={NavLink}
                                to={`/bonds/${bond.index}`}
                                key={i}
                                className={"bond"}
                                onClick={handleDrawerToggle}
                              >
                                <Typography variant="body2">
                                  {bond.displayName}
                                  <span className="bond-pair-roi">
                                    <DisplayBondDiscount key={bond.index} bond={bond} />
                                  </span>
                                </Typography>
                              </Link>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  </div> */}
                  {/* <NavItem to="/stake" icon="stake" label={t`Stake`} /> */}

                  {/* NOTE (appleseed-olyzaps): OlyZaps disabled until v2 contracts */}
                  {/*<NavItem to="/zap" icon="zap" label={t`Zap`} /> */}

                  {/* {EnvHelper.isGiveEnabled(location.search) && (
                    <NavItem to="/give" icon="give" label={t`Give`} chip={t`New`} />
                  )} */}
                  {/* <NavItem to="/wrap" icon="wrap" label={t`Wrap`} /> */}
                  {/* <NavItem
                    href={"https://synapseprotocol.com/?inputCurrency=gOHM&outputCurrency=gOHM&outputChain=43114"}
                    icon="bridge"
                    label={t`Bridge`}
                  /> */}
                  

                  {/* <NavItem href="https://pro.olympusdao.finance/" icon="olympus" label={t`Olympus Pro`} /> */}
                  {/* <NavItem to="/33-together" icon="33-together" label={t`3,3 Together`} /> */}
                  {/* <Box className="menu-divider">
                    <Divider />
                  </Box> */}
                </>
              ) : (
                <>
                  {/* <NavItem to="/wrap" SvgIcon={Wrap} Label="Wrap" /> */}
                  {/* <NavItem
                    href="https://synapseprotocol.com/?inputCurrency=gOHM&outputCurrency=gOHM&outputChain=43114"
                    to="https://synapseprotocol.com/?inputCurrency=gOHM&outputCurrency=gOHM&outputChain=43114"
                    SvgIcon={Bridge}
                    Label="Bridge"
                  /> */}
                </>
              )}
              {}
              {/* {Object.keys(externalUrls).map((link: any, i: number) => (
                <NavItem
                  key={i}
                  href={`${externalUrls[link].url}`}
                  icon={externalUrls[link].icon as any}
                  label={externalUrls[link].title as any}
                />
              ))} */}
            </div>
          </div>
        </div>
        {/* <Box className="dapp-menu-social" display="flex" justifyContent="space-between" flexDirection="column">
          <Social />
        </Box> */}
      </Box>
    </Paper>
  );
};

export default NavContent;
