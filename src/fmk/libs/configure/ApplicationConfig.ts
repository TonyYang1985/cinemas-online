export interface ApplicationConfig {
    appName: string;
    version: string;
    port: number;
    privateKeyPath: string;
    publicKeyPath: string;
  }
  
  export interface DatabaseConfig {
    mariaDBUrl: string;
    redis: string | any;
    output: string;
  }