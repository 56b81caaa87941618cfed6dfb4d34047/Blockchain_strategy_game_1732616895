import React from 'react';
import { ethers } from 'ethers';


class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Oops! Something went wrong.</h1>
          <p className="text-red-500">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ClickPointsGame: React.FC = () => {
  const [provider, setProvider] = React.useState<Ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<Ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<Ethers.Contract | null>(null);
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
      const web3Provider = new Ethers.providers.Web3Provider(window.ethereum as any);
      setProvider(web3Provider);
    }
  }, []);


  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const contract = new Ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);
        setIsConnected(true);

        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: Ethers.utils.hexValue(chainId) }],
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
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <h1 className="text-5xl font-bold mb-8 text-white shadow-lg">CryptoWars Click Game</h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div 
            className="w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer text-white text-3xl font-bold transform transition-transform duration-200 hover:scale-105"
            onClick={handleClick}
          >
            <i className='bx bx-target-lock mr-2'></i>
            Click Me!
          </div>
          <p className="mt-6 text-2xl font-semibold text-gray-800">Session Points: {sessionPoints}</p>
          <button 
            className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 flex items-center justify-center w-full"
            onClick={submitPoints}
          >
            <i className='bx bx-upload mr-2'></i>
            Submit Points
          </button>
          <div className="mt-6 flex justify-between text-gray-700">
            <p>Your Total Points: <span className="font-bold text-blue-600">{userPoints}</span></p>
            <p>Contract Total: <span className="font-bold text-purple-600">{totalPoints}</span></p>
          </div>
        </div>
        {!isConnected && (
          <button 
            className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
            onClick={connectWallet}
          >
            <i className='bx bx-wallet mr-2'></i>
            Connect Wallet
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export { ClickPointsGame as component };
};

export { ClickPointsGame as component };

