import { internalIpV4 } from 'internal-ip';
import os from 'os';
import { Get, JsonController, QueryParam } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { Logger } from '@footy/fmk/libs/logger';

@JsonController()
@Service()
export class HealthCheckController {
  private logger = Logger.getLogger(HealthCheckController);


  @Inject()
  private dataSource: DataSource;

//   constructor(private dataSource: DataSource) {}

  @Get('/_healthcheck')
  async healthCheck(@QueryParam('os') showOs: boolean) {
    try {
      const healthy = await this.dataSource.query('select "true"');
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
          networks: await internalIpV4(),
        };
        return { healthy, osInfo };
      }
      return {
        healthy,
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return { healthy: false, error };
    }
  }
}
