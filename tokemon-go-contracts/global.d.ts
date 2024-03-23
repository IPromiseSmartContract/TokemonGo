declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SEP_URL: string;
    }
  }
}

export {};
