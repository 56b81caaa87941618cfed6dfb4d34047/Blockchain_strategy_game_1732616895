
import React from 'react';
import * as ethers from 'ethers';

const LatestEventDisplay: React.FC = () => {
  const [latestEvent, setLatestEvent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const contractAddress = '0xD8C02cFb6356A813627AA0c1fcE7cD54dA545093';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "event PointsAdded(address indexed user, uint256 pointsAdded, uint256 newUserTotal)",
    "event TotalPointsUpdated(uint256 newTotalPoints)",
    "function addPoints(uint256 _points)",
    "function getUserPoints(address _user) view returns (uint256)",
    "function getTotalPoints() view returns (uint256)"
  ];

  const getLatestEvent = async () => {
    try {
      setError(null);
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        if (network.chainId !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              setError('Please add the Holesky network to your wallet and try again.');
            } else {
              setError('Failed to switch to the Holesky network. Please switch manually.');
            }
            return;
          }
        }

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const filter = contract.filters.PointsAdded();
        const events = await contract.queryFilter(filter, -10000, 'latest');


        if (events.length > 0) {
          const latestEvent = events[events.length - 1];
          setLatestEvent(`User ${latestEvent.args?.user} added ${latestEvent.args?.pointsAdded} points. New total: ${latestEvent.args?.newUserTotal}`);
        } else {
          setLatestEvent('No events found in the last 1000 blocks.');
        }
      } else {
        setError('Please install MetaMask or another web3 wallet to use this feature.');
      }
    } catch (err: any) {
      setError(`Error fetching latest event: ${err.message}`);
    }
  };

  React.useEffect(() => {
    const fetchLatestEvent = async () => {
      setIsLoading(true);
      await getLatestEvent();
      setIsLoading(false);
    };

    fetchLatestEvent();

    const intervalId = setInterval(fetchLatestEvent, 15000);

    return () => clearInterval(intervalId);
  }, []);


  return (
    <header className="bg-blue-500 text-white p-5 w-full">
      <div className="container mx-auto flex flex-col items-start">
        <div className="text-2xl font-bold mb-4">CryptoWars</div>
        <div className="bg-blue-600 p-4 rounded-lg shadow-md w-full">
          <h2 className="text-xl font-semibold mb-2">Latest Event</h2>
          {isLoading ? (
            <p className="mb-2 flex items-center">
              <i className='bx bx-loader-alt animate-spin mr-2'></i>
              Loading latest event...
            </p>
          ) : latestEvent ? (
            <p className="mb-2">{latestEvent}</p>
          ) : (
            <p className="mb-2">No events found.</p>
          )}
          {error && <p className="text-red-300 mb-2">{error}</p>}
          <button
            onClick={getLatestEvent}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <i className='bx bx-loader-alt animate-spin mr-2'></i>
            ) : (
              <i className='bx bx-refresh mr-2'></i>
            )}
            Refresh Latest Event
          </button>
        </div>
      </div>
    </header>
  );
};

export { LatestEventDisplay as component };
