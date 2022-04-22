const functions = require("firebase-functions");

const express = require("express");
const Web3 = require("web3");
const Provider = require("@truffle/hdwallet-provider");
const contract_abi = require("./abi/staking.json");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const app = express();
// const port = process.env.PORT || 5000;

const SmartContractAddress = "0x52d0f8171A9a093909f7Ec6159E08DA47f9ec53E";
const SmartContractABI = contract_abi;
const address = "0xd2E0AbEDF7edc31554f34c1AdB36A482f67A387a";
const privatekey = "8ad9f94a06909503b0bfa350737379dda551b6f492163f0d828159ddceb3ebc8";
const rpcurl = "https://data-seed-prebsc-1-s1.binance.org:8545";

const sendData = async () => {
  const provider = new Provider(privatekey, rpcurl);
  const web3 = new Web3(provider);
  const myContract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);

  const receipt = await myContract.methods.rebase().send({ from: address });
  console.log(receipt);

  console.log("Succesfully Rebased");
};

// app.get("/", (req, res) => {
//   sendData();
//   res.send("Hello World!");
// });
exports.Rebase = functions.pubsub.schedule("every 8 hours").onRun(context => {
  sendData();
  return null;
});

// app.listen(port);
// console.log("listening on", port);
