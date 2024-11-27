import React from 'react';
import ethers from 'ethers';

const Footer: React.FC = () => {
  const [tokens, setTokens] = React.useState<Array<{ symbol: string; balance: string }>>([]);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4268' }]
        });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Fetch ETH balance
        const ethBalance = await provider.getBalance(address);
        const formattedEthBalance = ethers.utils.formatEther(ethBalance);
        
        // For demonstration, we'll add some example tokens
        // In a real application, you'd fetch this data from the blockchain or an API
        const exampleTokens = [
          { symbol: 'ETH', balance: formattedEthBalance },
          { symbol: 'USDT', balance: '100.00' },
          { symbol: 'DAI', balance: '50.00' },
          { symbol: 'LINK', balance: '25.00' },
        ];
        
        setTokens(exampleTokens);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.log('Please install MetaMask!');
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
            <h4 className="text-lg font-semibold mb-2">Wallet</h4>
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
                <h5 className="text-lg font-semibold mb-2">Token List</h5>
                <ul className="space-y-2">
                  {tokens.map((token, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{token.symbol}</span>
                      <span>{token.balance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer as component };