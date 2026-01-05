import type { ThemeUIStyleObject } from 'theme-ui';

export default function createSX<T extends Record<string, ThemeUIStyleObject>>(
  styles: T,
) {
  return {
    ...styles,
  };
}
