import styles from './DisclaimerMessage.module.scss';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import { usePricesStore } from './Prices/state';

dayjs.extend(utc);

const selectUpdatedAt = (state) => state.updatedAt;

function DisclaimerMessage() {
  let { mobile } = useBreakpoints(BREAKPOINTS);
  const updatedAt = usePricesStore(selectUpdatedAt);

  function largeScreenText() {
    return (
      <p>
        {updatedAt && (
          <span>
            <span className={styles.indicator}>●</span>
            Data fetched: {dayjs(updatedAt).format('YYYY-MM-DD H:mm:ss')}
          </span>
        )}
      </p>
    );
  }

  function smallScreenText() {
    return (
      <>
        {updatedAt && (
          <p>
            <span className={styles.indicator}>●</span>
            Data fetched: {dayjs(updatedAt).format('YYYY-MM-DD H:mm:ss')}
          </p>
        )}
      </>
    );
  }

  return <div className={styles.disclaimer}>{mobile ? smallScreenText() : largeScreenText()}</div>;
}

export default DisclaimerMessage;
