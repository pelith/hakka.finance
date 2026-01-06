declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '@uauth/js' {
  export default class UAuth {
    constructor(options: any);
    user(): Promise<UserInfo>;
  }

  export interface UserInfo {
    sub: string;
  }
}