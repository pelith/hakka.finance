 /** @jsxImportSource theme-ui */


import { useNavigate } from '@tanstack/react-router';
import { MyButton } from '../../Common';
import images from '../../../images';
import styles from './styles';

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div sx={styles.emptyPageWrapper}>
      <img src={images.iconNoData}></img>
      <p sx={styles.noDataWarning}>No data found with this address</p>
      <div sx={styles.goToProductsBtnWrapper}>
        <MyButton styleKit='green' onClick={() => navigate({ to: '/products' })}>
          Try our products
        </MyButton>
      </div>
    </div>
  );
};

export default EmptyState;
