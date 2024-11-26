import React from 'react';
import * as Ethers from 'ethers';

const networks = [
  {
    name: 'Ethereum',
    rpc: 'https://eth.public-rpc.com',
    chainId: 1
  },
  {
    name: 'Holesky',
    rpc: 'https://ethereum-holesky-rpc.publicnode.com',
    chainId: 17000
  },
  {
    name: 'Sepolia',
    rpc: 'https://eth-sepolia.public-rpc.blastapi.io',
    chainId: 11155111
  },
  {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    chainId: 137
  }
];

const MultiChainTokenChecker = () => {
  const [walletAddress, setWalletAddress] = React.useState('');
  const [isConnected, setIsConnected] = React.useState(false);
  const [tokens, setTokens] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Basic ERC721 and ERC20 interfaces
  const erc721ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ];

  const erc20ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ];

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        checkTokens(accounts[0]);
      } else {
        setError('Please install MetaMask!');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const checkTokens = async (address) => {
    setLoading(true);
    setError('');
    const allTokens = {};

    for (const network of networks) {
      try {
        const provider = new Ethers.providers.JsonRpcProvider(network.rpc);
        const tokenData = await checkNetworkTokens(provider, address, network.name);
        allTokens[network.name] = tokenData;
      } catch (err) {
        console.error(`Error checking ${network.name}:`, err);
        allTokens[network.name] = { error: `Failed to fetch data from ${network.name}` };
      }
    }

    setTokens(allTokens);
    setLoading(false);
  };

  const checkNetworkTokens = async (provider, address, networkName) => {
    const result = {
      nfts: [],
      erc20: []
    };

    try {
      // Get all transactions for the address to find token contracts
      const history = await provider.send('eth_getLogs', [{
        fromBlock: '0x0',
        toBlock: 'latest',
        address: null,
        topics: [
          null,
          Ethers.utils.hexZeroPad(address.toLowerCase(), 32)
        ]
      }]);

      const uniqueContracts = [...new Set(history.map(log => log.address))];

      for (const contractAddress of uniqueContracts) {
        try {
          // Try as ERC721
          const nftContract = new Ethers.Contract(contractAddress, erc721ABI, provider);
          const balance = await nftContract.balanceOf(address);
          
          if (balance > 0) {
            const name = await nftContract.name().catch(() => 'Unknown');
            const symbol = await nftContract.symbol().catch(() => 'Unknown');
            
            result.nfts.push({
              address: contractAddress,
              balance: balance.toString(),
              name,
              symbol
            });
          }
        } catch (nftError) {
          console.error(`Error checking NFT contract ${contractAddress}:`, nftError);
          try {
            // Try as ERC20
            const tokenContract = new Ethers.Contract(contractAddress, erc20ABI, provider);
            const balance = await tokenContract.balanceOf(address);
            
            if (balance > 0) {
              const decimals = await tokenContract.decimals().catch(() => 18);
              const name = await tokenContract.name().catch(() => 'Unknown');
              const symbol = await tokenContract.symbol().catch(() => 'Unknown');
              
              result.erc20.push({
                address: contractAddress,
                balance: Ethers.utils.formatUnits(balance, decimals),
                name,
                symbol
              });
            }
          } catch (erc20Error) {
            console.error(`Error checking ERC20 contract ${contractAddress}:`, erc20Error);
            // Not a token contract or unable to read
            continue;
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning ${networkName}:`, err);
      throw new Error(`Failed to scan ${networkName}: ${err.message}`);
    }

    return result;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Multi-Chain Token Checker</h1>
        
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="mb-4">
            <p className="text-gray-600">Connected: {walletAddress}</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-4 text-gray-600">
            Scanning networks... This may take a few minutes.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {Object.entries(tokens).map(([network, data]) => (
              <div key={network} className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">{network}</h2>
                
                {data.error ? (
                  <p className="text-red-500">{data.error}</p>
                ) : (
                  <div className="space-y-4">
                    {data.nfts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">NFTs</h3>
                        <div className="space-y-2">
                          {data.nfts.map((nft, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                              <p>Name: {nft.name}</p>
                              <p>Symbol: {nft.symbol}</p>
                              <p>Balance: {nft.balance}</p>
                              <p className="text-sm text-gray-500">Contract: {nft.address}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {data.erc20.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">ERC20 Tokens</h3>
                        <div className="space-y-2">
                          {data.erc20.map((token, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                              <p>Name: {token.name}</p>
                              <p>Symbol: {token.symbol}</p>
                              <p>Balance: {token.balance}</p>
                              <p className="text-sm text-gray-500">Contract: {token.address}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.nfts.length === 0 && data.erc20.length === 0 && (
                      <p className="text-gray-500">No tokens found on this network</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { MultiChainTokenChecker as component };