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
        <span style={{ marginRight: 10 }}>
          +++ <strong>Under Development: v1.1</strong>
        </span>
        {updatedAt && (
          <span style={{ marginLeft: 10 }}>
            {' '}
            Lastest update: {dayjs(updatedAt).format('YYYY-MM-DD H:mm:ss')}
          </span>
        )}
        <span> +++</span>
      </p>
    );
  }

  function smallScreenText() {
    return (
      <>
        <p>
          <strong>+++ Under Development: v1.2 +++</strong>
        </p>
        {updatedAt && <p>{`Latest update: ${dayjs(updatedAt).format('YYYY-MM-DD H:mm:ss')}`}</p>}
      </>
    );
  }

  return <div className={styles.disclaimer}>{mobile ? smallScreenText() : largeScreenText()}</div>;
}

export default DisclaimerMessage;
