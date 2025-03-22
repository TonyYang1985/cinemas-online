import { Get, JsonController, Logger, Post, Put, rest } from '@footy/fmk';
import { Inject } from 'typedi';
import { SystemConfigsService } from '@footy/services';

@JsonController('/user')
export class UserController {
  private logger = Logger.getLogger(UserController);

  @Inject()
  private systemConfigsService: SystemConfigsService;

  @Get('/:scope/:name', 'admin', 'config.mgmt')
  async getConfig(@rest.Param('scope') scope: string, @rest.Param('name') configName: string) {
    //return this.systemConfigsService.getConfig(scope, configName);
  }

  @Get('', 'admin', 'config.mgmt')
  async getAllConfigs() {
    return this.systemConfigsService.getConfigs();
  }

  @Post('/:scope/:name', 'admin', 'config.mgmt')
  @rest.OnUndefined(202)
  async setValue(@rest.Param('scope') scope: string, @rest.Param('name') configName: string, @rest.Body({ transform: { excludeExtraneousValues: false } }) value: any) {
   // await this.systemConfigsService.setValue(scope, configName, value);
  }

  @Put('/:scope/:name/setEnable', 'admin', 'config.mgmt')
  @rest.OnUndefined(202)
  async setEnable(@rest.Param('scope') scope: string, @rest.Param('name') configName: string) {
    //await this.systemConfigsService.setEnable(scope, configName);
  }

  @Put('/:scope/:name/setDisable', 'admin', 'config.mgmt')
  @rest.OnUndefined(202)
  async setDisable(@rest.Param('scope') scope: string, @rest.Param('name') configName: string) {
    //await this.systemConfigsService.setDisable(scope, configName);
  }
}