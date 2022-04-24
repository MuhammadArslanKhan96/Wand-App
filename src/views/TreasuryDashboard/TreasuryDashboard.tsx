import "./TreasuryDashboard.scss";

import { useMediaQuery } from "@material-ui/core";
import { memo, useEffect } from "react";
import { useWeb3Context } from "src/hooks";

import { ContractHelper } from "../../contractHelper";
import { abi as MARKETPLACE_ABI } from "./MARKETPLACE_ABI.json";
import { abi as NFT_ABI } from "./NFT_ABI.json";

const TreasuryDashboard = memo(() => {
  const { address, networkId } = useWeb3Context();

  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");

  const NFTCollection = async () => {
    const web3 = await ContractHelper(networkId);
    const nft = new web3.eth.Contract(NFT_ABI, "0x6361910E7f9Ea0D5AF5cbecA3b3ba7D9C9FE57c9");
    const tvl = await nft.methods;
    console.log(tvl);
  };

  const createAskOrder = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0x57CFa123fb1431A1C53A91AfEfCE510D731B909a");
    const market = await MP.methods
      .createAskOrder("0x6361910E7f9Ea0D5AF5cbecA3b3ba7D9C9FE57c9", 0, "2")
      .send({ from: address });
    console.log({ market });
  };

  const buyNFT = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0x57CFa123fb1431A1C53A91AfEfCE510D731B909a");
    const market = await MP.methods
      .buyTokenUsingFTM("0x6361910E7f9Ea0D5AF5cbecA3b3ba7D9C9FE57c9", 0)
      .send({ from: address, value: "2" });
    console.log({ market });
  };

  const ViewAskOrder = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0x57CFa123fb1431A1C53A91AfEfCE510D731B909a");
    const orders = await MP.methods
      .viewAsksByCollectionAndTokenIds("0x6361910E7f9Ea0D5AF5cbecA3b3ba7D9C9FE57c9", [0])
      .call();
    console.log(orders);
  };

  useEffect(() => {
    NFTCollection();
    // marketplace();
  });
  return (
    <div id="treasury-dashboard-view" className={`${isSmallScreen && "smaller"} ${isVerySmallScreen && "very-small"}`}>
      <button onClick={createAskOrder}>Create Ask Order</button>
      <button onClick={ViewAskOrder}>View Ask order</button>
      <button onClick={buyNFT}>BUY NFT</button>
    </div>
  );
});

export default TreasuryDashboard;
