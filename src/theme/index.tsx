import { type Theme, merge } from 'theme-ui';
import { makeTheme } from '@theme-ui/css/utils';
const colorsLinear = [
  '#D9FbE3',
  '#B5F8CE',
  '#8CEB89',
  '#6AD7A8',
  '#3EBD93',
  '#2DA287',
  '#1F887A',
  '#136D6A',
  '#0B555A',
].reduce(
  (target, curr, i) => {
    return { ...target, [`primary-${i}00`]: curr };
  },
  {} as { [key: string]: string },
);

const defaultTheme = makeTheme({
  breakpoints: ['40em', '52em', '64em'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
    secondary: '#30c',
    muted: '#f6f6f6',
    main_green: '#3ebd93',
    dark_green: '#0b555a',
  },
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1,
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0,
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
  },
});

const customTheme = makeTheme({
  breakpoints: ['576px', '1560px', '1680px', '1900px'],
  colors: {
    background: '#fff',
    white_green: '#f7fbfc',
    primary: '#639',
    secondary: '#ff6347',
    main_green: '#3ebd93',
    dark_green: '#0b555a',
    black: '#253e47',
    black_grey: '#52666d',
    green: '#2da287',
    light_green: '#dae1e3',
    text_grey: '#929EA3',
    active_green: '#ebf0f2',
    'neutral-100': '#F7FBFC',
    'neutral-200': '#EBF0F2',
    'neutral-300': '#DAE1E3',
    'neutral-600': '#52666D',
    'neutral-900': '#253E47',
    ...colorsLinear,
  },
  background_linears: {
    backgroundImage: 'linear-gradient(to right, #6ad7c1, #8cebb9)',
  },
  fonts: {
    body: 'Open Sans, system-ui',
    heading: 'Georgia, serif',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    semi: 600,
    heading: 700,
    bold: 700,
  },
  // lineHeights: {
  //   body: 1.5,
  //   heading: 1.125
  // },
  lineHeights: [1.5, '24px', '32px', '60px'],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64, 72],
  space: [0, 4, 8, 16, 32, 80, 164, 256, 512],
  styles: {
    root: {
      overflow: 'hidden',
      fontFamily: 'body',
      fontWeights: {
        semi: 'body',
        bold: 'bold',
      },
      p: {
        lineHeight: [1, 1, 2, 2],
      },
    },
  },
});

export const theme: Theme = merge(defaultTheme, customTheme);
