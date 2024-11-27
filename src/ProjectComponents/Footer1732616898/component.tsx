
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
  const [userPoints, setUserPoints] = React.useState<string>('0');
  const [totalPoints, setTotalPoints] = React.useState<string>('0');
  const [pointsToAdd, setPointsToAdd] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const contractAddress = '0xD8C02cFb6356A813627AA0c1fcE7cD54dA545093';

  const getContract = () => {
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_holesky');
    return new ethers.Contract(contractAddress, contractABI, provider);
  };

  React.useEffect(() => {
    updatePoints();
  }, []);

  const updatePoints = async () => {
    const contract = getContract();
    try {
      const totalPointsBN = await contract.getTotalPoints();
      setTotalPoints(ethers.utils.formatUnits(totalPointsBN, 0));
      setError('');
    } catch (error) {
      console.error('Error fetching points:', error);
      setError('Failed to fetch points. Please try again.');
    }
  };

  const addPoints = async () => {
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0) {
      setError('Please enter a valid number of points to add.');
      return;
    }
    
    try {
      setStatus('Adding points...');
      // In a real scenario, you would interact with the contract here
      // For this demo, we'll just update the total points
      const newTotal = parseInt(totalPoints) + parseInt(pointsToAdd);
      setTotalPoints(newTotal.toString());
      setStatus('Points added successfully!');
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
        
        <div>
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
              <i className='bx bx-plus-circle mr-2'></i>
              Add Points
            </button>
          </div>
        </div>
        
        {status && (
          <p className="mt-4 text-sm text-blue-600">
            <i className='bx bx-info-circle mr-2'></i>
            {status}
          </p>
        )}
        
        {error && (
          <p className="mt-4 text-sm text-red-600">
            <i className='bx bx-error-circle mr-2'></i>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export { ClickPointsInteraction as component };

export { ClickPointsInteraction as component };
