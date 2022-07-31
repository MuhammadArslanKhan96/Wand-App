import * as ethers from "ethers";
import React, { useEffect, useState } from "react";
import { useWeb3Context } from "src/hooks";

import { ContractHelper } from "../../contractHelper";
import STAKING_ABI from "./STAKING_ABI.json";

const Contract = "0x05cb8463AE7C6f6e0787b0fC33aB7802F0116AC6";
export default function Staking() {
  const { address, networkId } = useWeb3Context();

  const [reward, setReward] = useState(0);
  const [values, setValues] = useState("");

  const changeReward = async () => {
    try {
      const web3 = await ContractHelper(networkId);
      const staking = new web3.eth.Contract(STAKING_ABI, Contract);
      const value = ethers.utils.parseEther(values);
      console.log({ value, address });
      const reward = await staking.methods.set_reward_per_second(value).send({
        from: address,
      });
      setReward(values);
      setValues("");
    } catch (err) {
      console.log(err);
    }
  };

  const getRewardPrice = async () => {
    const web3 = await ContractHelper(networkId);
    const staking = new web3.eth.Contract(STAKING_ABI, Contract);
    const reward = await staking.methods.per_second_reward().call();
    setReward(ethers.utils.formatEther(reward));
  };

  const onChange = e => setValues(e.target.value);

  useEffect(() => {
    getRewardPrice();
  }, []);
  return (
    <div id="treasury-dashboard-view" style={{ width: "100%" }}>
      <h1>Staking Admin panel</h1>
      <div style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
        <h5>
          Reward Per second
          <p style={{ marginTop: "10px" }}>{reward} CRO</p>
        </h5>
        <h5>
          Change Reward Per second
          <p style={{ marginTop: "10px" }}>
            <input value={values} onChange={onChange} name="reward" />
            <button onClick={changeReward}>Change</button>
          </p>
        </h5>
      </div>
    </div>
  );
}
