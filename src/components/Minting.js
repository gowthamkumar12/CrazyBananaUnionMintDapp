import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { connect } from "../redux/blockchain/blockchainActions";
import { fetchData } from "../redux/data/dataActions";
import Banana from '../assets/Banana.png'
import '../styles/Minting.css'

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function Minting(){
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`...`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });
  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.SYMBOL} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };
  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };
  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);
  return(
    <>
    <div className="mobile">
      <h1>Please Use Computer/Laptop For Better Minting Experience.</h1>
    </div>
    <section className="screen">
      <h1 className="text">Crazy Banana<br />Union</h1>
      <div className="container">
        <img className="image" src={Banana} width="500"/>
        {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
          <div className="content">
            <h1 className="content-text">Sale Has Not<span className="effect">Started</span> Yet.</h1> 
            <p className="content-ls">You can still find {CONFIG.NFT_NAME} on <a href={CONFIG.MARKETPLACE_LINK} target="_blank" rel="noreferrer" style={{color: '#0074CC'}}>{CONFIG.MARKETPLACE}</a></p>           
          </div>
        ):(
          <div className="content">
            <h1 className="content-text">Public Mint is <span className="effect">Live</span>.</h1>
            <p className="content-ls">LIMITED SALE</p>
            <p className="content-count">{data.totalSupply} / 10000</p>
            <br />
            {blockchain.account === "" || blockchain.smartContract === null ? (
              <>
                <p style={{fontSize:'20px'}}>Connect To The Polygon Main Network Inorder To Mint.</p>
                <br />
                <button className="mint-button" onClick={(e) =>{
                  e.preventDefault();
                  dispatch(connect());
                  getData();
                }}>CONNECT</button>
                {blockchain.errorMsg !== "" ? (
                  <p style={{fontSize:'20px', color:'red'}}>{blockchain.errorMsg}</p>
                ): null}
              </>
            ):(
              <>
              
              <p style={{fontSize:'20px'}}>Get Your Own Crazy Banana At Only 3 MATIC.</p>
              <br />
              <p style={{fontSize:'20px'}}>{feedback}</p>
              <br />
              <div className="content-btn">
                <button className="content-id"  
                disabled={claimingNft ? 1:0}
                onClick={(e) =>{
                  e.preventDefault();
                  decrementMintAmount();
                }}>-</button>
                <div className="content-space"></div>
                <p className="content-btn-text">{mintAmount}</p>
                <div className="content-space"></div>
                <button className="content-id"
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  incrementMintAmount();
                }}>+</button>
              </div>
              <br />
              <div>
                <button className="mint-button"
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  claimNFTs();
                  getData();
                }}>{claimingNft ? "MINTING" : "MINT"}</button>
              </div>
            
              </>
            )}
            </div>
        )}
      </div>
    </section>
    </>
  )
}
export default Minting