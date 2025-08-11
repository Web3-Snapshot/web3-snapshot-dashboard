import styles from './IconAndCurrencyIdCell.module.scss';
import { capitalize } from '../utils/helper_functions';

function IconAndCurrencyIdCell({ obj }) {
  return (
    <div className={styles.iconRoot}>
      <img src={obj.image} alt="coin" />
      <div>
        <span>{`${obj.symbol?.toUpperCase()}`}</span>
        <span>{`${obj.id && capitalize(obj.id)}`}</span>
      </div>
    </div>
  );
}

export default IconAndCurrencyIdCell;
