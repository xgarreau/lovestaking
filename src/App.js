import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import stakingABI from "./contracts/stakingABI.json";
import loveABI from "./contracts/loveABI.json";
const STAKING_CONTRACT_ADDRESS = "0x5cD2aC522775eC917Fe8e39830fd6E1a45bBe715";
const LOVE_CONTRACT_ADDRESS = "0xfc9C392A7e3e9F44f1a2FcFb173cD2d80de27b34";

// Reload page if network is changed
if (window.ethereum) {
  window.ethereum.on('chainChanged', function (networkId) {
      window.location.reload();
  });
}

function App() {
  const [isConnected, setConnected] = useState(false);
  const [connectBtnString, setConnectBtnString] = useState("Connect Wallet")
  const [claimBtnString, setClaimBtnString] = useState("Claim rewards")
  const [unstakeBtnString, setUnstakeBtnString] = useState("Unstake LOVE")
  const [approveBtnString, setApproveBtnString] = useState("Approve LOVE")
  const [stakeBtnString, setStakeBtnString] = useState("Stake LOVE")
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loveBalance, setLoveBalance] = useState(0);
  const [approvedLOVE, setApprovedLOVE] = useState(0);
  const [stakeBalance, setStakeBalance] = useState(0);
  const [rewardsBalance, setRewardsBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);

  async function updateBalances() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const signerBalance = await signer.getBalance();
    const loveContract = new ethers.Contract(LOVE_CONTRACT_ADDRESS, loveABI, signer);
    const signerLoveBalance = await loveContract.balanceOf(signerAddress);
    const signerApprovedLOVE = await loveContract.allowance(signerAddress, STAKING_CONTRACT_ADDRESS);
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);
    const signerStakingInfo = await contract.stakes(signerAddress);
    const signerRewardsBalance = await contract.computeRewards();
    setBalance(parseFloat(ethers.utils.formatEther(signerBalance)));
    setLoveBalance(parseFloat(ethers.utils.formatEther(signerLoveBalance)));
    setApprovedLOVE(parseFloat(ethers.utils.formatEther(signerApprovedLOVE)));
    setStakeBalance(parseFloat(ethers.utils.formatEther(signerStakingInfo.nbStaked)));
    setRewardsBalance(parseFloat(ethers.utils.formatEther(signerRewardsBalance)));
  }

  async function connectWallet () {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this dApp!');
      return;
    }
    setConnectBtnString("💗");
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethProvider.send('eth_requestAccounts', []);
      const signer = await ethProvider.getSigner();

      const signerAddress = await signer.getAddress();
      const signerBalance = await signer.getBalance();
      setAccount(signerAddress);
      setBalance(parseFloat(ethers.utils.formatEther(signerBalance)));

      await updateBalances();

      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);
      const signerStakingInfo = await contract.stakes(signerAddress);
      const signerRewardsBalance = await contract.computeRewards();
      setStakeBalance(ethers.utils.formatEther(signerStakingInfo.nbStaked));
      setRewardsBalance(ethers.utils.formatEther(signerRewardsBalance));

      setConnected (true);
    } catch (e) {
      console.log(e);
    }
    setConnectBtnString("Connect wallet");
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.reload();
    });
  };

  async function approveLove() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(LOVE_CONTRACT_ADDRESS, loveABI, signer);
    const amount = ethers.utils.parseEther(stakeAmount.toString());
    setApproveBtnString("💗");
    try {
      const tx = await contract.approve(STAKING_CONTRACT_ADDRESS, amount);
      await tx.wait();
    } catch (e) {
      console.log(e);
    }
    await updateBalances();
    setApproveBtnString("Approve LOVE");
  }

  async function stakeLove() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);
    const amount = ethers.utils.parseEther(stakeAmount.toString());
    setStakeBtnString("💗");
    try {
      const tx = await contract.stake(amount);
      await tx.wait();
    } catch (e) {
      console.log(e);
    }
    await updateBalances();
    setStakeBtnString("Stake LOVE");
  }

  async function claimRewards() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);
    setClaimBtnString("💗");
    try {
      const tx = await contract.withdrawRewards();
      await tx.wait();
    } catch (e) {
      console.log(e);
    }
    await updateBalances();
    setClaimBtnString("Claim rewards");
  }

  async function unstakeLove() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);
    setUnstakeBtnString("💗");
    try {
      const tx = await contract.unstake();
      await tx.wait();
    } catch (e) {
      console.log(e);
    }
    await updateBalances();
    setUnstakeBtnString("Unstake LOVE");
  }

  return (
    <>
      <nav>
        <ul>
          <li>
            <a href="https://lovefaucet.mescryptos.fr/">Faucet</a>
          </li>
          <li>💗</li>
          <li>
            <a href="https://lovestore.mescryptos.fr/">Buy</a>
          </li>
          <li>💗</li>
          <li>
            <a href="https://lovestaking.mescryptos.fr/">Stake</a>
          </li>
        </ul>
      </nav>
      <div className="App">
        <h1>The LOVE staking facility</h1>
        <header className="App-header">
          {isConnected === true ?
            <>
              <div className="header-container"> 
                <div className="header-image">
                  <img src="/staking.jpg" className="App-logo" alt="logo" />
                </div>
                <div className="header-infos">
                  <p>
                    Account: {account.substring(0, 6)+'...'+account.substring(account.length-4, account.length)}<br />
                    ZEN Balance: {parseFloat(balance > 0.000000001 ? balance : 0).toFixed(3)}<br />
                    $LOVE Balance: {parseFloat(loveBalance > 0.000000001 ? loveBalance : 0).toFixed(3)}<br />
                    $LOVE Staked: {parseFloat(stakeBalance > 0.000000001 ? stakeBalance : 0).toFixed(3)}<br />
                    $LOVE Rewards: {parseFloat(rewardsBalance > 0.000000001 ? rewardsBalance : 0).toFixed(3)}
                  </p>
                </div>
              </div>
              {
                stakeBalance == 0 && 
                <div className="inputDiv">
                  <div className="inputToken">LOVE</div>
                  <input type="text" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
                  <div className="inputQties">
                  <a href="#25" onClick={(e) => setStakeAmount(loveBalance/4)}>25%</a>
                  <a href="#50" onClick={(e) => setStakeAmount(loveBalance/2)}>50%</a>
                  <a href="#75" onClick={(e) => setStakeAmount(loveBalance*3/4)}>75%</a>
                  <a href="#100" onClick={(e) => setStakeAmount(loveBalance)}>100%</a>
                  </div>
                </div>
              }
              {
                rewardsBalance > 0 &&
                <button onClick={claimRewards} disabled={claimBtnString === "Claim rewards" ? "" : "disabled"}>{claimBtnString}</button>
              }
              {
                stakeBalance > 0 &&
                <button onClick={unstakeLove} disabled={unstakeBtnString === "Unstake LOVE" ? "" : "disabled"}>{unstakeBtnString}</button>
              }
              {
                stakeBalance == 0 && 
                stakeAmount > 0 && 
                approvedLOVE < stakeAmount &&
                <button onClick={approveLove} disabled={approveBtnString === "Approve LOVE" ? "" : "disabled"}>{approveBtnString}</button>
              }
              {
                stakeBalance == 0 && 
                stakeAmount > 0 && 
                approvedLOVE >= stakeAmount &&
                <button onClick={stakeLove} disabled={stakeBtnString === "Stake LOVE" ? "" : "disabled"}>{stakeBtnString}</button>
              }
            </>
          :
            <>
              <img src="/staking.jpg" className="App-logo" alt="logo" />
              <button className="connectButton" onClick={connectWallet}  disabled={connectBtnString === "Connect Wallet" ? "" : "disabled"}>{connectBtnString}</button>
            </>
          }
        </header>
      </div>
      <footer>Made with 💗 on <a href="https://eon.horizen.io/docs/">HorizenEON Yuma testnet</a> by <a href="https://twitter.com/xgarreau">xgarreau</a></footer>
    </>  
  );
}

export default App;
