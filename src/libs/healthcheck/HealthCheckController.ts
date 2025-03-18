import { internalIpV4 } from 'internal-ip';
import os from 'os';
import { Get, JsonController, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { Logger } from '@footy/fmk/libs/logger';

@JsonController()
@Service()
export class HealthCheckController {
    private logger = Logger.getLogger(HealthCheckController);

    constructor(private dataSource: DataSource) { }
    @Get('/_healthcheck')
    async healthCheck(@QueryParam('os') showOs: string) {
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
                return { ...osInfo, healthy };
            }
            return { healthy };
        } catch (err) {
            this.logger.error(err);
            return { healthy: false };
        }
    }
}
