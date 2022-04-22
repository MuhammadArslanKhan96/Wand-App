import { t } from "@lingui/macro";
import { Button, SwipeableDrawer, Typography, useTheme, withStyles } from "@material-ui/core";
import { useState } from "react";
import { useWeb3Context } from "src/hooks/web3Context";

import { ReactComponent as WalletIconDark } from "../../../assets/icons/Wallets.svg";
import { ReactComponent as WalletIconLight } from "../../../assets/icons/Wallets-light.svg";
import InitialWalletView from "./InitialWalletView";

const WalletButton = ({ openWallet, isLight }: { openWallet: () => void; isLight: string }) => {
  const { connect, connected } = useWeb3Context();
  const onClick = connected ? openWallet : connect;
  const label = connected ? t`Wallet` : t`Connect Wallet`;
  const theme = useTheme();
  return (
    <Button id="ohm-menu-button" variant="contained" color="secondary" onClick={onClick}>
      {/* <SvgIcon component={WalletIcon} style={{ marginRight: theme.spacing(1) }} /> */}
      {isLight === "dark" ? (
        <WalletIconLight style={{ width: "20px", height: "20px", marginRight: theme.spacing(1) }} />
      ) : (
        <WalletIconDark style={{ width: "20px", height: "20px", marginRight: theme.spacing(1) }} />
      )}
      <Typography>{label}</Typography>
    </Button>
  );
};

const StyledSwipeableDrawer = withStyles(theme => ({
  root: {
    width: "460px",
    maxWidth: "100%",
  },
  paper: {
    maxWidth: "100%",
  },
}))(SwipeableDrawer);

export function Wallet({ theme }: { theme: string }) {
  const [isWalletOpen, setWalletOpen] = useState(false);
  const closeWallet = () => setWalletOpen(false);
  const openWallet = () => setWalletOpen(true);

  // only enable backdrop transition on ios devices,
  // because we can assume IOS is hosted on hight-end devices and will not drop frames
  // also disable discovery on IOS, because of it's 'swipe to go back' feat
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <WalletButton openWallet={openWallet} isLight={theme} />
      <StyledSwipeableDrawer
        disableBackdropTransition={!isIOS}
        disableDiscovery={isIOS}
        anchor="right"
        open={isWalletOpen}
        onOpen={openWallet}
        onClose={closeWallet}
      >
        <InitialWalletView onClose={closeWallet} />
      </StyledSwipeableDrawer>
    </>
  );
}

export default Wallet;
