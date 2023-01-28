import styles from './Shared.module.scss';

function IconAndCurrencyIdCell({ obj }) {
  return (
    <div className={styles.imgSymbol}>
      <img src={obj.image_thumb} alt="coin" />
      <p>{`${obj.symbol.toUpperCase()} - ${obj.id.slice(0, 1).toUpperCase() + obj.id.slice(1)}`}</p>
    </div>
  );
}

export default IconAndCurrencyIdCell;
