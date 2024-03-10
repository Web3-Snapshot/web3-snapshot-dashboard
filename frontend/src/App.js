import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Prices from './components/Prices';
import Tokenomics from './components/Tokenomics';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { useIsIframe } from './custom-hooks/useIsIframe';

function App() {
  const isIframe = useIsIframe();
  const windowTopMessage = useRef(null);

  // Remove background if embedded in iframe on external site
  const bodyElement = document.querySelector('body');
  if (isIframe) {
    bodyElement?.style.setProperty('background', 'None');
  }

  useEffect(() => {
    // TODO: This needs more testing. Previously, we checked for a number of
    // different properties to get the correct height. It seems, however, that
    // we only need to check for `scrollHeight`. If that turns out to be sufficient,
    // we can simplify this function.
    function handleResize() {
      setTimeout(function determineScrollHeight() {
        const body = document.body;
        windowTopMessage.current = Math.max(
          // body.scrollHeight,
          // body.offsetHeight,
          body.scrollHeight
        );
        console.log('windowTopMessage.current', windowTopMessage.current);
        window.top.postMessage(windowTopMessage.current, '*');
      }, 500);
    }

    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
      windowTopMessage.current = null;
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
