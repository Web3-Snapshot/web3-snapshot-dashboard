import styles from './DisclaimerMessage.module.scss';
import dayjs from 'dayjs';
import axios from 'axios';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import { useEffect, useState } from 'react';

async function fetchTimestamp() {
  return axios
    .get('/api/tracking/timestamp')
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function DisclaimerMessage() {
  let { mobile } = useBreakpoints(BREAKPOINTS);
  const [updatedAt, setUpdatedAt] = useState('');

  function largeScreenText() {
    return (
      <p>
        <span>
          +++ <strong>Under Development: v1.1</strong> ::: Last update: <span>{updatedAt}</span> +++
        </span>
      </p>
    );
  }

  function smallScreenText() {
    return (
      <>
        <p>
          <strong>+++ Under Development: v1.1 +++</strong>
        </p>
        <p>{`Last update: ${updatedAt}`}</p>
      </>
    );
  }

  useEffect(() => {
    const sse = new EventSource('/api/tracking/timestamp');

    function handleStream(evt) {
      setUpdatedAt(dayjs(JSON.parse(evt.data).updated_at).format('YYYY-MM-DD - HH:mm:ss'));
    }

    sse.onmessage = (evt) => {
      handleStream(evt);
    };

    sse.onerror = () => {
      sse.close();
    };

    return () => {
      sse.close();
    };
  });

  return <div className={styles.disclaimer}>{mobile ? smallScreenText() : largeScreenText()}</div>;
}

export default DisclaimerMessage;
