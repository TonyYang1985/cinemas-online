import { Inject, Service } from 'typedi';
import { onEvent } from '@footy/fmk';
import { UserService } from '@footy/services';

@Service()
export class TestEventHandler {
  @Inject()
  userService: UserService;

  @onEvent('test.example')
  onTestEvent(param: unknown) {
    console.log(param);
    throw 'oh-my-god';
  }
}
