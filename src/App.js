import React, { useState } from 'react';
import VodafoneCalculator from './VodafoneCalculator';
import GebietsLaufliste from './GebietsLaufliste';
import Kundendatenbank from './Kundendatenbank';

function App() {
  const [activeApp, setActiveApp] = useState('calculator');

  return (
    <div className="App">
      <div className="flex gap-2 md:gap-4 p-2 md:p-4 bg-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveApp('calculator')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap ${
            activeApp === 'calculator' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Pencil-Selling
        </button>
        <button
          onClick={() => setActiveApp('laufliste')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap ${
            activeApp === 'laufliste' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Laufliste
        </button>
        <button
          onClick={() => setActiveApp('kundendatenbank')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap ${
            activeApp === 'kundendatenbank' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Kundendatenbank
        </button>
      </div>

      {activeApp === 'calculator' && <VodafoneCalculator />}
      {activeApp === 'laufliste' && <GebietsLaufliste />}
      {activeApp === 'kundendatenbank' && <Kundendatenbank />}
    </div>
  );
}

export default App;