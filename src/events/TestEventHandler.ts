import { Inject, Service } from 'typedi';
import { onEvent } from '@footy/fmk';
import { SystemConfigsService } from '@footy/services';

@Service()
export class TestEventHandler {
  @Inject()
  configService: SystemConfigsService;

  @onEvent('test.example')
  async onTestEvent(param: unknown) {
    const all = await this.configService.getConfigs();
    console.log(all);
  }
}
