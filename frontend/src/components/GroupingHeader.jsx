import styles from './GroupingHeader.module.scss';

function GroupingHeader() {
  return (
    <div className={styles.groupingHeaderRoot}>
      <div>Capitalization</div>
      <div>Supply</div>
      <div>Volume</div>
    </div>
  );
}

export default GroupingHeader;
