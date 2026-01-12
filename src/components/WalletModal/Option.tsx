import styles from './styles';
import logos from '../../assets';
import identiy from 'lodash/identity';

export default function Option({
  onClick = identiy,
  header,
  icon,
  id,
}: {
  onClick?: () => void;
  header: React.ReactNode;
  icon: string;
  id: string;
}) {
  const content = (
    <div
      sx={Object.assign(
        styles.optionCardClickable,
        styles.optionCard,
        styles.infoCard,
      )}
      id={id}
      onClick={onClick}
    >
      <div sx={styles.optionCardLeft}>
        <div sx={styles.headerText}>{header}</div>
      </div>
      <div sx={styles.iconWrapper}>
        <img src={logos[icon as keyof typeof logos]} alt='Icon' />
      </div>
    </div>
  );

  return content;
}
