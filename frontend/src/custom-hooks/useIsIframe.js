import { useState, useEffect } from 'react';

function isRenderedInIframe() {
  try {
    return window.self !== window.top;
  } catch (err) {
    return true;
  }
}

export const useIsIframe = () => {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(isRenderedInIframe());
  }, []);

  return isIframe;
};
