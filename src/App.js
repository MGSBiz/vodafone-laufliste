import React, { useState } from 'react';
import VodafoneCalculator from './VodafoneCalculator';
import GebietsLaufliste from './GebietsLaufliste';
import Kundendatenbank from './Kundendatenbank';

function App() {
  const [activeApp, setActiveApp] = useState('calculator');

  return (
    <div className="App">
      <div className="flex gap-4 p-4 bg-gray-800">
        <button
          onClick={() => setActiveApp('calculator')}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeApp === 'calculator' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Pencil-Selling Assistant
        </button>
        <button
          onClick={() => setActiveApp('laufliste')}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeApp === 'laufliste' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Gebiets-Laufliste
        </button>
                <button
          onClick={() => setActiveApp('kundendatenbank')}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeApp === 'laufliste' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
        >
          Kunden
        </button>
      </div>

      {activeApp === 'calculator' && <VodafoneCalculator />}
      {activeApp === 'laufliste' && <GebietsLaufliste />}
      {activeApp === 'kundendatenbank' && <Kundendatenbank />}
    </div>
  );
}

export default App;