import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Prices from './components/Prices';
import Tokenomics from './components/Tokenomics';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { useIsIframe } from './custom-hooks/useIsIframe';

function App() {
  const isIframe = useIsIframe();
  return (
    <>
      {!isIframe && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="prices" />} />
          <Route path="prices" element={<Prices />} />
          <Route path="tokenomics" element={<Tokenomics />} />
        </Route>
        <Route path="*" element={<></>} />
      </Routes>
    </>
  );
}

export default App;
