import {  Get, JsonController, Logger } from '@footy/fmk';
import { SystemConfigsService } from '@footy/services';
import { Inject } from 'typedi';

@JsonController('/configs')
export class SystemConfigsController {
  private logger = Logger.getLogger(SystemConfigsController);

  @Inject()
  private systemConfigsService: SystemConfigsService;

  @Get('/all', '*', 'cinemas-online.configs.get')
  async getAllConfigs() {
    return await this.systemConfigsService.getConfigs();
  }
}
