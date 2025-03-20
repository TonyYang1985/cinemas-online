import 'reflect-metadata';
import { Socket, Server } from 'socket.io';
import { Service, Inject } from 'typedi';
import { UserService } from '@footy/services';

@Service()
export class UserController {
  @Inject()
  private userService!: UserService;

  private namespace: string = '/users';

  getNamespace(): string {
    return this.namespace;
  }

  async handleConnection(socket: Socket, io: Server): Promise<void> {
    console.log('client connected');
    const allUsers = await this.userService.getAllUsers();
    socket.emit('all', allUsers);
  }

  disconnect(socket: Socket): void {
    console.log('client disconnected');
  }

  registerEvents(socket: Socket, io: Server): void {
    socket.on('load', async (email: string) => {
      try {
        const user = await this.userService.getOne(email);
        socket.emit('done', user);
      } catch (error) {
        console.error('Error loading user:', error);
        socket.emit('error', { message: 'Failed to load user' });
      }
    });
  }
}
