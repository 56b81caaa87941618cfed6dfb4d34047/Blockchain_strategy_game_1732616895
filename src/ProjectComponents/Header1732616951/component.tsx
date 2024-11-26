import React from 'react';
import { ethers } from 'ethers';
import React from 'react';


const ClickPointsGame: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [sessionPoints, setSessionPoints] = React.useState(0);
  const [userPoints, setUserPoints] = React.useState(0);
  const [totalPoints, setTotalPoints] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);


  const contractAddress = '0xD8C02cFb6356A813627AA0c1fcE7cD54dA545093';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function addPoints(uint256 _points) external",
    "function getUserPoints(address _user) external view returns (uint256)",
    "function getTotalPoints() external view returns (uint256)",
    "event PointsAdded(address indexed user, uint256 pointsAdded, uint256 newUserTotal)",
    "event TotalPointsUpdated(uint256 newTotalPoints)"
  ];

  React.useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
      setProvider(web3Provider);
    }
  }, []);


  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);
        setIsConnected(true);

        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              alert('Please add the Holesky testnet to your wallet and try again.');
            }
          }
        }

        updatePointsDisplay();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const updatePointsDisplay = async () => {
    if (contract && signer) {
      try {
        const address = await signer.getAddress();
        const userPointsBN = await contract.getUserPoints(address);
        setUserPoints(userPointsBN.toNumber());
        const totalPointsBN = await contract.getTotalPoints();
        setTotalPoints(totalPointsBN.toNumber());
      } catch (error) {
        console.error("Failed to update points display:", error);
      }
    }
  };

  const handleClick = () => {
    setSessionPoints(prevPoints => prevPoints + 1);
  };

  const submitPoints = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    
    if (contract && sessionPoints > 0) {
      try {
        const tx = await contract.addPoints(sessionPoints);
        await tx.wait();
        setSessionPoints(0);
        updatePointsDisplay();
      } catch (error) {
        console.error("Failed to submit points:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">CryptoWars Click Game</h1>
      <div 
        className="w-64 h-64 bg-blue-500 rounded-lg shadow-md flex items-center justify-center cursor-pointer text-white text-2xl font-bold"
        onClick={handleClick}
      >
        Click Me!
      </div>
      <p className="mt-4 text-xl">Session Points: {sessionPoints}</p>
      <button 
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
        onClick={submitPoints}
      >
        Submit Points
      </button>
      <p className="mt-4">Your Total Points: {userPoints}</p>
      <p>Contract Total Points: {totalPoints}</p>
    </div>
  );
};

export { ClickPointsGame as component };
