declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_NAME: string
      NEXT_PUBLIC_TOKEMON_GO_FACTORY_CONTRACT_ADDRESS: string
    }
  }

  interface Window {
    ethereum: any
  }
}

export {}
