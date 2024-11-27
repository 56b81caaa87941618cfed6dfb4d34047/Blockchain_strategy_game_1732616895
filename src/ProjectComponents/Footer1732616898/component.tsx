
import React from 'react';
import ethers from 'ethers';

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_points",
        "type": "uint256"
      }
    ],
    "name": "addPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserPoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const ClickPointsInteraction: React.FC = () => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [userAddress, setUserAddress] = React.useState<string>('');
  const [userPoints, setUserPoints] = React.useState<string>('0');
  const [totalPoints, setTotalPoints] = React.useState<string>('0');
  const [pointsToAdd, setPointsToAdd] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const contractAddress = '0xD8C02cFb6356A813627AA0c1fcE7cD54dA545093';
  const holeskyChainId = '0x4268';

  const getContract = (signer: ethers.Signer) => {
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        if (network.chainId !== 17000) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: holeskyChainId }]
          });
        }
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsConnected(true);
        await updatePoints(signer);
        setError('');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      setError('Please install MetaMask!');
    }
  };

  const updatePoints = async (signer: ethers.Signer) => {
    const contract = getContract(signer);
    try {
      const userPointsBN = await contract.getUserPoints(await signer.getAddress());
      const totalPointsBN = await contract.getTotalPoints();
      setUserPoints(ethers.utils.formatUnits(userPointsBN, 0));
      setTotalPoints(ethers.utils.formatUnits(totalPointsBN, 0));
      setError('');
    } catch (error) {
      console.error('Error fetching points:', error);
      setError('Failed to fetch points. Please try again.');
    }
  };

  const addPoints = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0) {
      setError('Please enter a valid number of points to add.');
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = getContract(signer);
    
    try {
      setStatus('Adding points...');
      const tx = await contract.addPoints(ethers.utils.parseUnits(pointsToAdd, 0));
      setStatus('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      setStatus('Points added successfully!');
      await updatePoints(signer);
      setPointsToAdd('');
      setError('');
    } catch (error) {
      console.error('Error adding points:', error);
      setError('Failed to add points. Please try again.');
    } finally {
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5" style={{backgroundImage: 'url(https://raw.githubusercontent.com/56b81caaa87941618cfed6dfb4d34047/Blockchain_strategy_game_1732616895/main/src/assets/images/c721e239b1c349c5a91cd392a2b9cc59.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-5">
        <h2 className="text-2xl font-bold mb-5 text-center">Click Points Interaction</h2>
        
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p className="mb-2">
              <span className="font-semibold">Address:</span> {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Your Points:</span> {userPoints}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Total Points:</span> {totalPoints}
            </p>
            <div className="flex mb-4">
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Points to add"
                className="flex-grow mr-2 p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addPoints}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              >
                Add Points
              </button>
            </div>
          </div>
        )}
        
        {status && (
          <p className="mt-4 text-sm text-blue-600">{status}</p>
        )}
        
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export { ClickPointsInteraction as component };
