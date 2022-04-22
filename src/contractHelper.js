import { ethers } from "ethers";
import Web3 from "web3";

export const ContractHelper = networkId =>
  new Promise(async (resolve, reject) => {
    // Modern dapp browsers...
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Accounts now exposed
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      console.log("Injected web3 detected.");
      resolve(web3);
      // Fallback to localhost; use dev console port by default...
    } else {
      const provider = new Web3.providers.HttpProvider(
        // "http://127.0.0.1:8545"
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
      );
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      resolve(web3);
    }
  });

export const Account = () =>
  new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = provider.listAccounts();
        // Accounts now exposed
        resolve(accounts);
      } catch (error) {
        reject(error);
      }
    }
  });
