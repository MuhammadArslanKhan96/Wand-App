import "./TreasuryDashboard.scss";

import { useMediaQuery } from "@material-ui/core";
import axios from "axios";
import { ethers } from "ethers";
import { memo, useEffect, useState } from "react";
import { useWeb3Context } from "src/hooks";

import { ContractHelper } from "../../contractHelper";
// import { abi as MARKETPLACE_ABI } from "./MARKETPLACE_ABI.json";
import { abi as CRONOS_ABI } from "./CRONOS_ABI.json";
import Staking from "./Staking";
// import { abi as IERC_20 } from "src/abi/IERC20.json";
const Contract = "0x708adC59b1039605FFec8FeF4551476607aCD8ca";

const TreasuryDashboard = memo(() => {
  const { address, networkId } = useWeb3Context();
  const [images, setImages] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [nftData, setNftData] = useState({
    basePrice: 0,
    totalPrice: 0,
    creatorFee: 0,
    minterFee: 0,
    treasury: 0,
  });
  const [values, setValues] = useState({
    nftPrice: null,
    minterFeeValue: null,
    creatorFeeValue: null,
    treasryValue: null,
    ownerValue: null,
  });

  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");

  const NFTCollection = async () => {
    const web3 = await ContractHelper(networkId);
    const nft = new web3.eth.Contract(CRONOS_ABI, Contract);
    const tvl = await nft.methods;
  };

  const get_nft_data = async () => {
    setLoading(true);
    try {
      const web3 = await ContractHelper(networkId);
      const nft = new web3.eth.Contract(CRONOS_ABI, Contract);
      const price = await nft.methods.NFTPrice().call();
      const creatorFee = await nft.methods.CreatorRoyalityFee().call();
      const minterFee = await nft.methods.MinterRoyalityFee().call();
      const treasury = await nft.methods.Treasury().call();

      const fromWei = ethers.utils.formatEther(price);
      const calculateFee = (fromWei * creatorFee) / 100;
      console.log(fromWei, calculateFee);
      setNftData({
        basePrice: ethers.utils.formatEther(price),
        totalPrice: Number(calculateFee) + Number(fromWei),
        creatorFee,
        minterFee,
        treasury: `0x..${treasury.substring(treasury.length - 4)}`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    const isOwner = await MP.methods.owner().call();
    const market = await MP.methods.safeMint(address).send(
      isOwner !== address
        ? {
            from: address,
            value: "3150000000000000000",
          }
        : {
            from: address,
          },
    );
    getNFT();
    console.log({ market });
    getNFT();
  };

  const getNFT = async () => {
    try {
      setLoading(true);
      if (!address) return;
      const web3 = await ContractHelper(networkId);
      const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
      for (let i = 0; i <= 10000; i++) {
        const ownerOf = await MP.methods.ownerOf(i).call();
        if (ownerOf === address) {
          const uri = await MP.methods.tokenURI(i).call();
          const { data } = await axios.get(`${uri}.json`);
          const image_url = data.imaga; // yahan ayga images ka url
          // images.push(metadata.image);
          setImages(images => [...images, data.image]);
        }
      }
      console.log({ getNFT });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    const market = await MP.methods.buyTokenUsingFTM(Contract, 1).send({ from: address, value: "300" });
    console.log({ market });
  };

  const changeNFTPrice = async () => {
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    const market = await MP.methods.setNFTPrice(values.nftPrice).send({ from: address });
    console.log({ market });
  };

  const changeFee = async () => {
    const { minterFeeValue, creatorFeeValue } = values;
    const { creatorFee, minterFee } = nftData;
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    console.log(minterFeeValue, creatorFeeValue);
    const market = await MP.methods
      .setFee(minterFeeValue || minterFee, creatorFeeValue || creatorFee)
      .send({ from: address });
    console.log({ market });
  };

  const changeTreasury = async () => {
    const { treasryValue } = values;
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    console.log(minterFeeValue, creatorFeeValue);
    const market = await MP.methods.changeTreasury(treasryValue).send({ from: address });
    console.log({ market });
  };

  const changeOwner = async () => {
    const { ownerValue } = values;
    const web3 = await ContractHelper(networkId);
    const MP = new web3.eth.Contract(CRONOS_ABI, Contract);
    console.log(minterFeeValue, creatorFeeValue);
    const market = await MP.methods.changeOwner(ownerValue).send({ from: address });
    console.log({ market });
  };

  const onChange = e => setValues({ ...values, [e.target.name]: e.target.value });

  useEffect(() => {
    get_nft_data();
    getNFT();
    // marketplace();
  }, [address]);

  const { basePrice, totalPrice, creatorFee, minterFee, treasury } = nftData;
  const { nftPrice, creatorFeeValue, minterFeeValue, treasryValue, ownerValue } = values;
  if (isLoading) return "Loading....";
  return (
    <div id="treasury-dashboard-view" className={`${isSmallScreen && "smaller"} ${isVerySmallScreen && "very-small"}`}>
      <div className="nft-data">
        <h3>Admin Panel</h3>
        <div>
          <p>NFT Total Price</p>
          <p>{totalPrice} CRO</p>
        </div>

        <div style={{ width: "100%", height: "2px", background: "#fff" }} />
        <div>
          <p>
            NFT Base Price
            <p style={{ marginTop: "10px" }}>{basePrice} CRO</p>
          </p>
          <p>
            Change NFT Base Price
            <p style={{ marginTop: "10px" }}>
              <input value={nftPrice} onChange={onChange} name="nftPrice" />
              <button onClick={changeNFTPrice}>Change</button>
            </p>
          </p>
        </div>

        <div style={{ width: "100%", height: "2px", background: "#fff" }} />

        <div>
          <p>
            Creator Fee
            <p style={{ marginTop: "10px" }}>{creatorFee} CRO</p>
          </p>
          <p>
            Change Creator Fee
            <p style={{ marginTop: "10px" }}>
              <input
                value={creatorFeeValue ?? creatorFee}
                values={creatorFee}
                onChange={onChange}
                name="creatorFeeValue"
              />
              <button onClick={changeFee}>Change</button>
            </p>
          </p>
        </div>

        <div style={{ width: "100%", height: "2px", background: "#fff" }} />

        <div>
          <p>
            Minter Fee
            <p style={{ marginTop: "10px" }}>{minterFee} CRO</p>
          </p>
          <p>
            Change Minter Fee
            <p style={{ marginTop: "10px" }}>
              <input value={minterFeeValue ?? minterFee} onChange={onChange} name="minterFeeValue" />
              <button onClick={changeFee}>Change</button>
            </p>
          </p>
        </div>

        <div style={{ width: "100%", height: "2px", background: "#fff" }} />

        <div>
          <p>
            Treasury Address:
            <p style={{ marginTop: "10px" }}>{treasury} CRO</p>
          </p>
          <p>
            Change Treasury Address
            <p style={{ marginTop: "10px" }}>
              <input value={treasryValue} onChange={onChange} name="treasryValue" />
              <button onClick={changeTreasury}>Change</button>
            </p>
          </p>
        </div>

        <div>
          <p>
            Owner Address:
            <p style={{ marginTop: "10px" }}>{treasury} CRO</p>
          </p>
          <p>
            Change Owner Address
            <p style={{ marginTop: "10px" }}>
              <input value={ownerValue} onChange={onChange} name="ownerValue" />
              <button onClick={changeOwner}>Change</button>
            </p>
          </p>
        </div>
      </div>
      {/* <button onClick={mintNFT}>Mint NFT</button>
      <h2>Your NFTs</h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px" }}>
        {isLoading
          ? "Loading"
          : images.length < 1
          ? 0
          : images.map((item, index) => {
              console.log(item);
              return (
                <div key={index}>
                  NFT No {index + 1}
                  <br />
                  <br />
                  <img
                    src={item}
                    style={{ borderRadius: "6px", marginRight: "30px" }}
                    alt="nft"
                    width="100"
                    height="100"
                  />
                </div>
              );
            })}
      </div> */}

      <Staking />
    </div>
  );
});

export default TreasuryDashboard;
