import styles from './DisclaimerMessage.module.scss';

function DisclaimerMessage() {
  return (
    <div className={styles.disclaimer}>
      <p>
        +++ <strong>Under Development: v.1.0 </strong> ::: Full incremental update every ~40 min +++
      </p>
    </div>
  );
}

export default DisclaimerMessage;
