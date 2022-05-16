import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import tiktok from "./public/tiktok.png";
import ig from "./public/ig.png";
import twt from "./public/twt.png";
import github from "./public/github.png";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [sendingWave, setSendingWave] = useState(false);
  const [totalWavesCount, setTotalWavesCount] = useState("");
  const [myTotalWavesCount, setMyTotalWavesCount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [contractBalance, setContractBalance] = useState();

  const contractABI = abi.abi;
  const contractAddress = "0x7D525aAe0f22edF92602208e45f4Fcd396805090";
  
  const authorizedAddy = "0xf41123669f91b482626b198bd72f2A1E6E62fB5a";

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            luck: wave.lucky,
          });
        });
        wavesCleaned.reverse();
        setAllWaves(wavesCleaned);
        
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getContractBalance = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await provider.getBalance(contractAddress);
        setContractBalance(ethers.utils.formatEther(balance));
        console.log("Contract balnce is  ", ethers.utils.formatEther(balance));
    
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
    
  }

  const checkIfAuthorized = async () => {
    console.log("currentAccount address = ", currentAccount);
    console.log("authorizedAddy = ", authorizedAddy);
    if (currentAccount == authorizedAddy) {
      setAuthorized(true);
      console.log("setAuthorized must be true == ", authorized);
      return;
    } else {
      setAuthorized(false);
      console.log("setAuthorized must be false ==", authorized);
    }
  }
  
  const checkIfWalletIsConnected = async () => {
    console.log("checkIfWalletIsConnected is executed");
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        getAllWaves();
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("Found an authorized account:", account);        
        // console.log("Checking if setCurrentAccount works = ", currentAccount);
        // totalWaves();
        myWaves();
        checkIfAuthorized();
        
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
        setSendingWave(true);
        console.log("Mining...", waveTxn.hash);
        
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        setSendingWave(false);
        totalWaves();
        myWaves();
        setMessage("");
        getAllWaves();
        getContractBalance();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      if (error instanceof RPC) {
        alert("Wait 1 minnute");
      } else {
        console.log(error);
      }
    } 
  }

  const totalWaves = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        setTotalWavesCount(count.toNumber());
        //getContractBalance();
        // checkIfAuthorized();
        console.log("Total number of waves is...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const myWaves = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myCount = await wavePortalContract.getMyWaves();
        setMyTotalWavesCount(myCount.toNumber());
        console.log("I have waved...", myCount.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withrawAll = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const withrawTxn = await wavePortalContract.withdrawAll();
        console.log("Mining...", withrawTxn.hash);
        await withrawTxn.wait();
        console.log("Mined -- ", withrawTxn.hash);

        if (withrawTxn) {
          console.log("Withdrawal is successful");
        } else {
          console.log("Withdrawal failed");
        }
        
      } else {
        console.log("Ethereum object doesn't exist");
      }   
    } catch (error) {
      console.log(error);
    }
  }


  // useEffect(() => {
  //   checkIfWalletIsConnected();
  // }, []);

  useEffect(() => {
    async function listenAccount() {
      window.ethereum.on('accountsChanged', function (accounts) {
        // myWaves();
        // totalWaves();
        checkIfWalletIsConnected();
      });
    }
     // process.setMaxListeners(0);require('events').EventEmitter.defaultMaxListeners = 15;
    checkIfWalletIsConnected();
    getContractBalance();
    myWaves();
    totalWaves();
    // checkIfAuthorized();
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message, luck) => {
      console.log("NewWave", from, timestamp, message, luck);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          luck: luck,
        },
      ]);
      
    };
      
      
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
    
    listenAccount();
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  


  return (
    <div className="">
      <header>
        <div>
          <a href="https://www.tiktok.com/@rostyslavdzhohola">
            <img src={tiktok} alt="TikTok" width="40" height="40" />
          </a>
          <a href="https://www.instagram.com/dzhohola_/">
            <img src={ig} alt="IG" width="40" height="40"/>
          </a>
          <a href="https://twitter.com/dzhohola">
            <img src={twt} alt="Twitter" width="40" height="40"/>
          </a>
          <a href="https://github.com/RostyslavDzhohola">
            <img src={github} alt="Github" width="40" height="40"/>
          </a>
        </div>
        <div>
          {!authorized && (
            <button className="waveButton" onClick={withrawAll}>
              Withdraw All
            </button>
          )}
            <div>
              Contract Balance {contractBalance}
            </div>
             
        </div>
      </header>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
          👋 Send me a message. Win a prize!
          </div>
  
          <div className="bio">
            It's Rostyslav. I am web3 dev and this is my project from &nbsp;
            <a href="https://buildspace.so/">Buildspace</a>. 
            <br/>Send me a message and win a tiny bit of crypto. 
          </div>
    
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
          <div className="message-box">
            <label htmlFor="text">Message: </label>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter your message" className="input">
            </input>
          </div>
          {sendingWave && (
            <div className="loader"></div>
          )} 
            
          <div className="waveCounter">
            <button className="waveButton2" onClick={totalWaves}>
              Total Waves
            </button>
            <div className="wavesDisplay2">{totalWavesCount}</div>
            <button className="waveButton2" onClick={myWaves}>
              My waves
            </button>
            <div className="wavesDisplay2">{myTotalWavesCount}</div>
          </div>
          {/*
          * If there is no currentAccount render this button
          */}
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
  
          {allWaves.map((wave, index) => {
            return (
              <div key={index} style={{
                  backgroundColor: "OldLace", 
                  marginTop: "16px", 
                  padding: "8px", 
                  border: "1px solid black",
                  borderRadius: "5px"
                }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message} </div>
                <div>Luck: {wave.luck ? "Winner" : "Loser"}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default App