
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

const Footer: React.FC = () => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [userPoints, setUserPoints] = React.useState<string>('0');
  const [totalPoints, setTotalPoints] = React.useState<string>('0');
  const [pointsToAdd, setPointsToAdd] = React.useState<string>('');
  const [userAddress, setUserAddress] = React.useState<string>('');

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
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  const updatePoints = async (signer: ethers.Signer) => {
    const contract = getContract(signer);
    try {
      const userPointsBN = await contract.getUserPoints(await signer.getAddress());
      const totalPointsBN = await contract.getTotalPoints();
      setUserPoints(ethers.utils.formatUnits(userPointsBN, 0));
      setTotalPoints(ethers.utils.formatUnits(totalPointsBN, 0));
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const addPoints = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = getContract(signer);
    
    try {
      const tx = await contract.addPoints(ethers.utils.parseUnits(pointsToAdd, 0));
      await tx.wait();
      await updatePoints(signer);
      setPointsToAdd('');
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  return (
    <footer className="bg-gray-800 text-white p-8 w-full h-full">
      <div className="container mx-auto h-full">
        <div className="flex flex-wrap justify-between h-full">
          
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">CryptoWars</h3>
            <p className="text-gray-400">© 2023 CryptoWars. All rights reserved. Play responsibly.</p>
          </div>

          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className='bx bxl-facebook text-xl'></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className='bx bxl-twitter text-xl'></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className='bx bxl-instagram text-xl'></i>
              </a>
            </div>
          </div>

          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Click Points</h4>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center"
              >
                <i className='bx bx-wallet mr-2'></i>
                Connect Wallet
              </button>
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <p className="mb-2">Address: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
                <p className="mb-2">Your Points: {userPoints}</p>
                <p className="mb-2">Total Points: {totalPoints}</p>
                <div className="flex mt-4">
                  <input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder="Points to add"
                    className="mr-2 p-2 rounded-lg text-black"
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer as component };
