import { SystemConfigsService } from '@footy/services';
import 'reflect-metadata';
import { Socket, Server } from 'socket.io';
import { Service, Inject } from 'typedi';

@Service()
export class EmployeesController {
  @Inject()
  private configService!: SystemConfigsService;

  private namespace: string = '/employees';

  getNamespace(): string {
    return this.namespace;
  }

  async handleConnection(socket: Socket, io: Server): Promise<void> {
    console.log('client connected');
    const all = await this.configService.getConfigs();
    socket.emit('all', all);
  }

  disconnect(socket: Socket): void {
    console.log('client disconnected');
  }

  registerEvents(socket: Socket, io: Server): void {
    socket.on('load', async (email: string) => {
      try {
        const all = await this.configService.getConfigs();
        socket.emit('done', all);
      } catch (error) {
        console.error('Error loading user:', error);
        socket.emit('error', { message: 'Failed to load user' });
      }
    });
  }
}
