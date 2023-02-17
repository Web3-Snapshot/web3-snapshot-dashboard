import styles from './IconAndCurrencyIdCell.module.scss';
import { capitalize } from '../util/helpers';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';

function IconAndCurrencyIdCell({ obj }) {
  let { ss, xs } = useBreakpoints(BREAKPOINTS);

  return (
    <div className={styles.imgSymbol}>
      <img src={obj.image_thumb} alt="coin" />
      <p>{`${obj.symbol.toUpperCase()}${ss || xs ? '' : ' - ' + capitalize(obj.id)}`}</p>
    </div>
  );
}

export default IconAndCurrencyIdCell;
