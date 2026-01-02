// import moment from 'moment'
// import axios from 'axios'
// import { isNull, isUndefined } from 'util'
// import numeral from 'numbro'
// import { chainType } from './constant'

// export const showNotification = (
//   title = 'Success',
//   description = '',
//   type = 'open'
// ) => {
//   notification[type]({
//     message: title,
//     description: description || '',
//     placement: 'bottomRight'
//   })
// }

export const standardNameFileUpload = (name: string) =>
  name.split(' ').join('').replace('.png', '');

export const lowerCase = (value: string) => (value ? value.toLowerCase() : value);

export const upperCase = (value: string) => (value ? value.toUpperCase() : value);

export const generateId = () => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


export const upperCaseFirstLetter = (lower: string) => {
  if (!lower) return lower;
  const upper = lower.replace(/^\w/, (chr) => chr.toUpperCase());
  return upper;
};

// const blobToBase64 = (blob) => {
//   const reader = new FileReader()
//   reader.readAsDataURL(blob)
//   return new Promise((resolve) => {
//     reader.onloadend = () => {
//       resolve(reader.result)
//     }
//   })
// }

