import { Get, JsonController, Logger, Post, Put, rest } from '@footy/fmk';
import { Inject, Service } from 'typedi';
import { SystemConfigsService } from '@footy/services';

@JsonController('/configs')
@Service()
export class SystemConfigsController {
  private logger = Logger.getLogger(SystemConfigsController);

  @Inject()
  private systemConfigsService: SystemConfigsService;

  @Get('/all', '*', 'cinemas-online.configs.get')
  async getAllConfigs() {
    return this.systemConfigsService.getAllConfigs();
  }
}
