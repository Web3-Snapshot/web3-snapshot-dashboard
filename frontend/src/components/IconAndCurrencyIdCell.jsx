import styles from './IconAndCurrencyIdCell.module.scss';
import { capitalize } from '../utils/helper_functions';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';

function IconAndCurrencyIdCell({ obj }) {
  let { ss, xs } = useBreakpoints(BREAKPOINTS);

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
