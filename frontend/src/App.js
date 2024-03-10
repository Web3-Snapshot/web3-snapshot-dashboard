import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Prices from './components/Prices';
import Tokenomics from './components/Tokenomics';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { useIsIframe } from './custom-hooks/useIsIframe';

function App() {
  const isIframe = useIsIframe();

  // Remove background if embedded in iframe on external site
  const bodyElement = document.querySelector('body');
  if (isIframe) {
    bodyElement?.style.setProperty('background', 'None');
  }

  useEffect(() => {
    function handleResize() {
      setTimeout(function determineScrollHeight() {
        const body = document.body;
        const html = document.documentElement;
        let message = Math.max(
          body.scrollHeight,
          // body.offsetHeight,
          // html.clientHeight,
          html.scrollHeight
          // html.offsetHeight
        );
        window.top.postMessage(message, '*');
      }, 500);
    }

    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
