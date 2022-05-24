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
    const nft = new web3.eth.Contract(NFT_ABI, "0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d");
    const tvl = await nft.methods;
    console.log(tvl);
  };

  const createAskOrder = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0xEE72D4baFfb8A86c2D7449b3e2b8d61d46264b35");
    const market = await MP.methods
      .createAskOrder("0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d", 0, "300")
      .send({ from: address });
    console.log({ market });
  };

  const modifyAskOrder = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0xEE72D4baFfb8A86c2D7449b3e2b8d61d46264b35");
    const market = await MP.methods
      .modifyAskOrder("0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d", 1, "100")
      .send({ from: address });
    console.log({ market });
  };

  const buyNFT = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0xEE72D4baFfb8A86c2D7449b3e2b8d61d46264b35");
    const market = await MP.methods
      .buyTokenUsingFTM("0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d", 0)
      .send({ from: address, value: "300" });
    console.log({ market });
  };

  const addCollection = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0xEE72D4baFfb8A86c2D7449b3e2b8d61d46264b35");
    const market = await MP.methods
      .addCollection("0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d", address, address, 100, 100)
      .send({ from: address });
    console.log({ market });
  };

  const ViewAskOrder = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(MARKETPLACE_ABI, "0xEE72D4baFfb8A86c2D7449b3e2b8d61d46264b35");
    const orders = await MP.methods
      .viewAsksByCollectionAndTokenIds("0x2DF4e525A94C827e4F3B6d6488f1Ec4172f92B8d", [0])
      .call();
    console.log(orders);
  };

  useEffect(() => {
    NFTCollection();
    // marketplace();
  });
  return (
    <div id="treasury-dashboard-view" className={`${isSmallScreen && "smaller"} ${isVerySmallScreen && "very-small"}`}>
      <button onClick={createAskOrder}>Create Ask Order</button> <br />
      <br />
      <button onClick={ViewAskOrder}>View Ask order</button>
      <br />
      <br />
      <button onClick={buyNFT}>BUY NFT</button>
      <br />
      <br />
      <button onClick={buyNFT}>Modify Ask Order</button>
      <br />
      <br />
      <button onClick={addCollection}>Add Collection</button>
    </div>
  );
});

export default TreasuryDashboard;
