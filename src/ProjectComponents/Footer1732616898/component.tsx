import React from 'react';

const ClickPointsInteraction: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-5" style={{backgroundImage: 'url(https://raw.githubusercontent.com/56b81caaa87941618cfed6dfb4d34047/Blockchain_strategy_game_1732616895/main/src/assets/images/c721e239b1c349c5a91cd392a2b9cc59.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-5">
        <h2 className="text-2xl font-bold mb-5 text-center">Click Points Interaction</h2>
        
        <p className="text-center text-gray-600">
          <i className='bx bx-info-circle mr-2'></i>
          Wallet and points functionality has been removed.
        </p>
      </div>
    </div>
  );
};

export { ClickPointsInteraction as component };
