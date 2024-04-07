import styles from './GroupingHeader.module.scss';
import { useLocation } from 'react-router-dom';

const groups = {
  prices: [],
  tokenomics: ['Capitalization', 'Supply', 'Volume'],
};

function GroupingHeader() {
  const location = useLocation();
  const groupKey = location.pathname.replace(/\/+$/, '').replace(/^\//, '');
  console.log('groupKey', groupKey);

  return (
    <div className={styles.groupingHeaderRoot}>
      {groups[groupKey].map((group) => (
        <div key={group}>{group}</div>
      ))}
    </div>
  );
}

export default GroupingHeader;
