import styles from './breakpoints.scss';

const [ss, xs, sm, md, lg] = [+styles.ssBp, +styles.xsBp, +styles.smBp, +styles.mdBp, +styles.lgBp];

export const COINS = 2;

// Material UI default breakpoints: (xs - 600, sm - 900, md - 1200, lg - 1536)
export const BREAKPOINTS = {
  ss: { min: 0, max: ss }, // super small < 400
  xs: { min: ss + 1, max: xs },
  sm: { min: xs + 1, max: sm },
  md: { min: sm + 1, max: md },
  lg: { min: md + 1, max: lg },
  xl: { min: lg + 1, max: null },
  mobile: { min: 0, max: sm },
  tablet: { min: sm + 1, max: md },
  desktop: { min: md + 1, max: null },
};
