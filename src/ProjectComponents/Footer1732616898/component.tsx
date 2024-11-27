
import React from 'react';
import { ethers } from 'ethers';

const ClickPointsInterface: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [userPoints, setUserPoints] = React.useState<string>('');
  const [totalPoints, setTotalPoints] = React.useState<string>('');
  const [pointsToAdd, setPointsToAdd] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const contractAddress = '0xD8C02cFb6356A813627AA0c1fcE7cD54dA545093';
  const chainId = 17000; // Holesky testnet

  const abi = [
    {"inputs":[{"internalType":"uint256","name":"_points","type":"uint256"}],"name":"addPoints","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getTotalPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"pointsAdded","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newUserTotal","type":"uint256"}],"name":"PointsAdded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotalPoints","type":"uint256"}],"name":"TotalPointsUpdated","type":"event"}
  ];

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          setError(`Please connect to Holesky testnet (Chain ID: ${chainId})`);
          return;
        }
        setProvider(provider);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        setContract(contract);
        setError('');
      } else {
        setError('Please install MetaMask!');
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  const checkConnection = async () => {
    if (!provider) {
      await connectWallet();
    }
    return !!provider;
  };

  const getUserPoints = async () => {
    setLoading(true);
    try {
      if (await checkConnection() && contract) {
        const signer = provider!.getSigner();
        const address = await signer.getAddress();
        const points = await contract.getUserPoints(address);
        setUserPoints(points.toString());
        setError('');
      }
    } catch (err) {
      setError('Failed to get user points: ' + (err as Error).message);
    }
    setLoading(false);
  };

  const getTotalPoints = async () => {
    setLoading(true);
    try {
      if (await checkConnection() && contract) {
        const points = await contract.getTotalPoints();
        setTotalPoints(points.toString());
        setError('');
      }
    } catch (err) {
      setError('Failed to get total points: ' + (err as Error).message);
    }
    setLoading(false);
  };

  const addPoints = async () => {
    setLoading(true);
    try {
      if (await checkConnection() && contract && pointsToAdd) {
        const signer = provider!.getSigner();
        const contractWithSigner = contract.connect(signer);
        const tx = await contractWithSigner.addPoints(pointsToAdd);
        await tx.wait();
        setError('Points added successfully!');
        getUserPoints();
        getTotalPoints();
        setPointsToAdd('');
      }
    } catch (err) {
      setError('Failed to add points: ' + (err as Error).message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-5">
        <h2 className="text-2xl font-bold mb-5 text-center">Click Points Interface</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <input
            type="number"
            placeholder="Points to add"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(e.target.value)}
            className="border p-2 mr-2"
          />
          <button 
            onClick={addPoints} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Points'}
          </button>
        </div>

        <div className="mb-4">
          <button 
            onClick={getUserPoints} 
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            disabled={loading}
          >
            Get User Points
          </button>
          <button 
            onClick={getTotalPoints} 
            className="bg-purple-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Get Total Points
          </button>
        </div>

        {userPoints && <p className="mb-2">Your Points: {userPoints}</p>}
        {totalPoints && <p className="mb-4">Total Points: {totalPoints}</p>}
      </div>
    </div>
  );
};

export { ClickPointsInterface as component };
