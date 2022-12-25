import styles from "./Shared.module.css";

function IconAndCurrencyIdCell({ obj }) {
  return (
    <div className={styles.imgSymbol}>
      <img src={obj.image.thumb} alt='coin' />
      <p>{obj.symbol.toUpperCase()}</p>
    </div>
  );
}

export default IconAndCurrencyIdCell;
