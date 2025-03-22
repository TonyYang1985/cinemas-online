import os from 'os';
import { Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { Get, JsonController, QueryParam } from 'routing-controllers';
import { Logger } from '@footy/fmk/libs/logger';
import { getLocalIpAddress } from '@footy/fmk/libs/network';

@JsonController()
@Service()
export class HealthCheckController {
  private logger = Logger.getLogger(HealthCheckController);
  
  @Inject()
  private dataSource: DataSource;

  @Get('/_healthcheck')
  async healthCheck(@QueryParam('os') showOs: boolean) {
    try {
      const dbAlive = await this.dataSource.query('select "true"');
      const networks = await getLocalIpAddress();
      if (showOs) {
        const osInfo = {
          hostname: os.hostname(),
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          release: os.release(),
          uptime: os.uptime(),
          loadavg: os.loadavg(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          cpus: `${os.cpus()[0].model} x ${os.cpus().length}`,
          networks: networks,
        };
        return { healthy: true, dbAlive, osInfo };
      }
      return {
        healthy: true,
        dbAlive,
      };
    } catch (error: unknown) {
      this.logger.error('Health check failed', error);
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
