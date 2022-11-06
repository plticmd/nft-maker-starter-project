// NftUploader.jsx
import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import { Web3Storage } from 'web3.storage'

const NftUploader = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };
  const connectWallet = async () =>{
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };


/*
  let chainId = await ethereum.request({ method: "eth_chainId" });
console.log("Connected to chain " + chainId);
// 0x5 は Goerli の ID です。
const goerliChainId = "0x5";
if (chainId !== goerliChainId) {
  alert("You are not connected to the Goerli Test Network!");
}
*/



  const askContractToMintNft = async (ipfs) => {
    const CONTRACT_ADDRESS =
      "0x35558364D864EAAcE19c10d84437969F133eDf12";
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintIpfsNFT("sample",ipfs);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };


  const renderNotConnectedContainer = () => (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
    );
  /*
   * ページがロードされたときに useEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDMxQjEzQ2JhZDE0MzUyOTI0RkU3NTFFNzQ3ODIyYUEyMmE5QTUxNTQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjcxMjE1ODU1OTUsIm5hbWUiOiJORlQtTWFrZXIifQ.vlz9L__yS6tzdCbNjH-_-D7nCUll2jez1DV5j4psjDs";

  const imageToNFT = async (e) => {
    const client = new Web3Storage({ token: API_KEY })
    const image = e.target
    console.log(image)

    const rootCid = await client.put(image.files, {
        name: 'experiment',
        maxRetries: 3
    })
    const res = await client.get(rootCid) // Web3Response
    const files = await res.files() // Web3File[]
    for (const file of files) {
      console.log("file.cid:",file.cid)
      askContractToMintNft(file.cid)
    }
}

  return (
    <div className="outerBox">
      {currentAccount === "" ? (
        renderNotConnectedContainer()
      ) : (
        <p>Just choose a file ➡︎ you can mint NFT</p>
      )}
      <div className="title">
        <h2>NFTアップローダー</h2>
        <h3>mp.3もアップできる！</h3>
      </div>
      
      <div className="nftUplodeBox">
        <div className="imageLogoAndText">
          <img src={ImageLogo} alt="imagelogo" />
          <p>こちらへドラッグ＆ドロップ</p>
        </div>
        <input className="nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png, .mp3" onChange={imageToNFT} />
      </div>
      <p>または</p>
      <Button variant="contained">
        ファイルを選択
        <input className="nftUploadInput" type="file" accept=".jpg , .jpeg , .png , .mp3" onChange={imageToNFT} />
      </Button>
      

      <p>Next you need to do is "Go to<a href = "imageGallery/image-gallery/src/index.html">Gallery</a>and Web3Storage...😓”</p>

    </div>
    
  );
};



export default NftUploader;