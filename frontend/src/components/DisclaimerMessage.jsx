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
  const [timestamp, setTimestamp] = useState('');

  function largeScreenText() {
    return (
      <p>
        <span>
          +++ <strong>Under Development: v1.1</strong> ::: Last update: ${timestamp} +++
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
        <p>{`Last update: ${timestamp}`}</p>
      </>
    );
  }

  useEffect(() => {
    async function getTimestamp() {
      fetchTimestamp()
        .then((res) => {
          setTimestamp(dayjs(res.updated_at).format('YYYY-MM-DD - HH:mm:ss'));
        })
        .catch((err) => {
          console.log('Could not fetch timestamp');
        });
    }

    getTimestamp();
  }, []);

  return <div className={styles.disclaimer}>{mobile ? smallScreenText() : largeScreenText()}</div>;
}

export default DisclaimerMessage;
