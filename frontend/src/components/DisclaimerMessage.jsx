import styles from './DisclaimerMessage.module.scss';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';

function largeScreenText() {
  return (
    <p>
      +++ <strong>Under Development: v1.0 </strong> ::: Full incremental update every 20 min +++
    </p>
  );
}

function smallScreenText() {
  return (
    <>
      <p>
        <strong>+++ Under Development: v1.0 +++</strong>
      </p>
      <p>Full incremental update every 20 min</p>
    </>
  );
}

function DisclaimerMessage() {
  let { mobile } = useBreakpoints(BREAKPOINTS);

  return <div className={styles.disclaimer}>{mobile ? smallScreenText() : largeScreenText()}</div>;
}

export default DisclaimerMessage;
