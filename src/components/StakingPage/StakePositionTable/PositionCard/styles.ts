import { ThemeUICSSObject } from 'theme-ui';

const cardContainer: ThemeUICSSObject = {
  border: 'solid 1px var(--theme-ui-colors-neutral-300)',
  padding: '20px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const rowEle: ThemeUICSSObject = {
  fontSize: '14px',
  flexGrow: 1,
  minWidth: '100%',
  '.title': {
    color: 'var(--theme-ui-colors-neutral-900)',
  },
  '.value': {
    fontSize: '16px',
    color: 'var(--theme-ui-colors-neutral-900)',
    marginRight: 'auto',
    '.icon': {
      marginRight: '5px',
      verticalAlign: 'middle'
    }
  },
  '.sub-title': {
    color: 'rgba(37, 62, 71, 0.5)',
    float: 'right'
  },
  '& button': {
    flexGrow: 1
  }
};

export default {
  cardContainer,
  rowEle,
};
