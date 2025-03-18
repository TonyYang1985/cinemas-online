export interface ApplicationConfig {
  appName: string;
  version: string;
  build: string;
  port: number;
  privateKeyPath: string;
  publicKeyPath: string;
  domains: string[];
}

export interface DatabaseConfig {
  mariaDBUrl: string;
  redis: string | any;
  output: string;
}
