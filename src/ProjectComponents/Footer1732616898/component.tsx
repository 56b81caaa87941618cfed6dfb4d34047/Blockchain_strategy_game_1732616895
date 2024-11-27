
import React from 'react';
import { ethers } from 'ethers';

const UniswapV2FactoryInterface: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [pairsLength, setPairsLength] = React.useState<string>('');
  const [pairAddress, setPairAddress] = React.useState<string>('');
  const [feeTo, setFeeTo] = React.useState<string>('');
  const [feeToSetter, setFeeToSetter] = React.useState<string>('');
  const [pairIndex, setPairIndex] = React.useState<string>('');
  const [tokenA, setTokenA] = React.useState<string>('');
  const [tokenB, setTokenB] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const contractAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
  const chainId = 1; // Ethereum Mainnet

  const abi = [
    {"name":"allPairs","stateMutability":"view","inputs":[{"name":"","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},
    {"name":"allPairsLength","stateMutability":"view","inputs":[],"outputs":[{"name":"","type":"uint256"}]},
    {"name":"createPair","stateMutability":"nonpayable","inputs":[{"name":"tokenA","type":"address"},{"name":"tokenB","type":"address"}],"outputs":[{"name":"pair","type":"address"}]},
    {"name":"feeTo","stateMutability":"view","inputs":[],"outputs":[{"name":"","type":"address"}]},
    {"name":"feeToSetter","stateMutability":"view","inputs":[],"outputs":[{"name":"","type":"address"}]},
    {"name":"getPair","stateMutability":"view","inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"outputs":[{"name":"","type":"address"}]}
  ];

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          setError(`Please connect to Ethereum Mainnet (Chain ID: ${chainId})`);
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

  const getAllPairsLength = async () => {
    try {
      if (!contract) {
        await connectWallet();
      }
      if (contract) {
        const length = await contract.allPairsLength();
        setPairsLength(length.toString());
        setError('');
      }
    } catch (err) {
      setError('Failed to get pairs length: ' + (err as Error).message);
    }
  };

  const getPairByIndex = async () => {
    try {
      if (!contract) {
        await connectWallet();
      }
      if (contract && pairIndex) {
        const pair = await contract.allPairs(pairIndex);
        setPairAddress(pair);
        setError('');
      }
    } catch (err) {
      setError('Failed to get pair: ' + (err as Error).message);
    }
  };

  const getPairByTokens = async () => {
    try {
      if (!contract) {
        await connectWallet();
      }
      if (contract && tokenA && tokenB) {
        const pair = await contract.getPair(tokenA, tokenB);
        setPairAddress(pair);
        setError('');
      }
    } catch (err) {
      setError('Failed to get pair: ' + (err as Error).message);
    }
  };

  const getFeeTo = async () => {
    try {
      if (!contract) {
        await connectWallet();
      }
      if (contract) {
        const feeToAddress = await contract.feeTo();
        setFeeTo(feeToAddress);
        setError('');
      }
    } catch (err) {
      setError('Failed to get feeTo: ' + (err as Error).message);
    }
  };

  const getFeeToSetter = async () => {
    try {
      if (!contract) {
        await connectWallet();
      }
      if (contract) {
        const feeToSetterAddress = await contract.feeToSetter();
        setFeeToSetter(feeToSetterAddress);
        setError('');
      }
    } catch (err) {
      setError('Failed to get feeToSetter: ' + (err as Error).message);
    }
  };

  const createPair = async () => {
    try {
      if (!provider) {
        await connectWallet();
      }
      if (provider && contract && tokenA && tokenB) {
        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const tx = await contractWithSigner.createPair(tokenA, tokenB);
        await tx.wait();
        setError('Pair created successfully!');
      }
    } catch (err) {
      setError('Failed to create pair: ' + (err as Error).message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-5">
        <h2 className="text-2xl font-bold mb-5 text-center">UniswapV2Factory Interface</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
          Connect Wallet
        </button>

        <div className="mb-4">
          <button onClick={getAllPairsLength} className="bg-green-500 text-white px-4 py-2 rounded">
            Get All Pairs Length
          </button>
          {pairsLength && <p className="mt-2">Total Pairs: {pairsLength}</p>}
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="Pair Index"
            value={pairIndex}
            onChange={(e) => setPairIndex(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={getPairByIndex} className="bg-green-500 text-white px-4 py-2 rounded">
            Get Pair by Index
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Token A Address"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Token B Address"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={getPairByTokens} className="bg-green-500 text-white px-4 py-2 rounded">
            Get Pair by Tokens
          </button>
        </div>

        {pairAddress && <p className="mb-4">Pair Address: {pairAddress}</p>}

        <div className="mb-4">
          <button onClick={getFeeTo} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
            Get Fee To
          </button>
          <button onClick={getFeeToSetter} className="bg-green-500 text-white px-4 py-2 rounded">
            Get Fee To Setter
          </button>
        </div>

        {feeTo && <p className="mb-2">Fee To: {feeTo}</p>}
        {feeToSetter && <p className="mb-4">Fee To Setter: {feeToSetter}</p>}

        <div className="mb-4">
          <button onClick={createPair} className="bg-purple-500 text-white px-4 py-2 rounded">
            Create Pair
          </button>
          <p className="text-sm text-gray-500 mt-2">
            (Make sure to input Token A and Token B addresses before creating a pair)
          </p>
        </div>
      </div>
    </div>
  );
};

export { UniswapV2FactoryInterface as component };
