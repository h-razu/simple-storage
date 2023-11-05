import "./App.css";
import Web3 from "web3";
// import { ethers } from "ethers";
import { useEffect, useState } from "react";

import contractABI from "./contractABIs/SimpleStorage.json";
// const ethers = require("ethers");
import { ethers } from "ethers";

function App() {
  const [value, setValue] = useState(0);
  const [smartContract, setSmartContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const provider =
      window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`);

    const loadContract = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("METAMASK ACCOUNT CONNECTION SUCCESSFUL....!!!");
      } else {
        alert("Please Install Metamask!!!");
      }
      // console.log(accounts);

      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });

      /**
       * TO CONNECT WITH SMART CONTRACT, NEED TWO THINGS:
       * 1. ABI: have to import from ./src/contracts folder. found after migrate smart contract
       * 2. DEPLOYED CONTRACT ADDRESS
       */
      const signer = provider.getSigner();

      const network = await provider.getNetwork();
      const chain = await network.chainId;
      // console.log(chain);

      //get deployed network
      const deployedNetwork1 = contractABI.networks[chain];
      // console.log(deployedNetwork1.address);

      // //creating  contract instance
      const cont = new ethers.Contract(deployedNetwork1.address, contractABI.abi, signer);

      setSmartContract(cont);
    };

    isConnected && provider && loadContract();
  }, [isConnected]);

  const createConnection = () => {
    setIsConnected(!isConnected);
  };

  const setAmount = async () => {
    const value = document.getElementById("amount").value;
    // console.log(value);

    const setData = async () => {
      const res = await smartContract.setter(value);
      await res.wait();

      if (res.hash) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
        document.getElementById("amount").value = "";
      }
    };

    value > 0 && smartContract && setData();
  };
  const getValue = async () => {
    const getData = async () => {
      const result = await smartContract.getter();
      // console.log(result.toNumber());
      setValue(result?.toNumber());
    };

    smartContract && getData();
  };

  return (
    <div className="App">
      <header className="App-header">
        {success && (
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Amount Set has been confirmed!</span>
          </div>
        )}
        <button className="btn btn-wide mb-6" onClick={() => createConnection()}>
          {isConnected ? "Connected" : "Connect To Metamask"}
        </button>
        <div className="flex gap-2 mb-6">
          <input type="text" id="amount" placeholder="Insert Amount" className="input input-bordered input-secondary w-full max-w-xs" />
          <button className="btn btn-active btn-ghost" onClick={() => setAmount()}>
            Add Amount
          </button>
        </div>
        <div className="flex gap-2 mb-6 items-center">
          <h2 className="kbd ps-2 font-bold">{value}</h2>
          <button className="btn btn-outline btn-secondary text-sm" onClick={() => getValue()}>
            Get Balance
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
