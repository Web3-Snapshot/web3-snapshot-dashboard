import React from 'react';
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

  const eventList = ['load', 'resize'];
  for (const event of eventList) {
    window.addEventListener(
      event,
      function (e) {
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
      },
      false
    );
  }

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
