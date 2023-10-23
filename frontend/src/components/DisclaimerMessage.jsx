import styles from './DisclaimerMessage.module.scss';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import { useEffect, useState } from 'react';

dayjs.extend(utc);

async function fetchTimestamp() {
  return axios
    .get('/api/tracking/timestamp')
    .then((res) => {
      debugger;
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
      const parsedData = JSON.parse(JSON.parse(evt.data))?.data?.updated_at;
      //   JSON.parse(
      //     ' "{\\"data\\": {\\"changed\\": 98, \\"updated_at\\": \\"2023-10-23T21:55:01.303786+00:00\\"}, \\"errors\\": []}"'
      //   )
      // )?.data?.updated_at;

      if (parsedData) {
        console.log(parsedData);
        const localTime = dayjs.utc(parsedData).local();
        setUpdatedAt(localTime.format('YYYY-MM-DD - HH:mm:ss'));
      }
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
