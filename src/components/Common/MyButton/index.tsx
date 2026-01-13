import { Button, Box } from 'rebass';
import styles from './styles';

interface IProps {
  disabled?: boolean;
  onClick: () => void;
  styleKit?: string;
  children?: React.ReactNode;
}

const MyButton = (props: IProps) => {
  const { disabled, onClick, styleKit, children } = props;

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      sx={styleKit === 'green' ? styles.mybutton_green : styles.mybutton}
    >
      <Box>{children}</Box>
    </Button>
  );
};

export default MyButton;
