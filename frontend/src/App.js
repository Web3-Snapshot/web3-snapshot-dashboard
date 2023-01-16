import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Prices from './components/Prices';
import Supply from './components/Supply';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { fetchCoins } from './pages/Dashboard';

export async function loader() {
  const coins = await fetchCoins();
  return { coins };
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="prices" />} />
          <Route path="prices" element={<Prices />} />
          <Route path="supply" element={<Supply />} />
        </Route>
        <Route path="*" element={<></>} />
      </Routes>
    </>
  );
}

export default App;
