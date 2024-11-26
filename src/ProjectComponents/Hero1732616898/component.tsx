import React from 'react';

const Hero: React.FC = () => {
  
  return (
    <div className="bg-black py-16 text-white w-full h-full relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
        style={{backgroundImage: `url('https://raw.githubusercontent.com/56b81caaa87941618cfed6dfb4d34047/Blockchain_strategy_game_1732616895/main/src/assets/images/c721e239b1c349c5a91cd392a2b9cc59.jpeg')`}}
      ></div>
      <div className="relative container mx-auto px-4 flex flex-col md:flex-row items-center h-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center h-full">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">Conquer the Crypto Realm</h1>
          <p className="text-xl mb-6">Engage in epic battles, build alliances, and dominate the blockchain in this thrilling strategy game</p>
        </div>
      </div>
    </div>
  );
};

export { Hero as component }