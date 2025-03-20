import { ClassType } from '@footy/fmk/libs/type';
import { Container } from 'typedi';
import SocketIO from 'socket.io';

/**
 * 设置Socket.IO控制器
 * @param io Socket.IO服务器实例
 * @param controllers 控制器类型数组
 */
export function setupSocketControllers(io: SocketIO.Server, controllers: ClassType[]) {
  for (const controllerClass of controllers) {
    try {
      let controller;
      try {
        controller = Container.get(controllerClass);
      } catch (e) {
        controller = new controllerClass();
        Container.set(controllerClass, controller);
      }
      
      let namespace = '/';
      if (typeof controller.getNamespace === 'function') {
        namespace = controller.getNamespace();
      } else if (controller.namespace) {
        namespace = controller.namespace;
      }
      
      const nsp = namespace === '/' ? io : io.of(namespace);
      
      nsp.on('connection', (socket) => {
        console.log(`Socket connected to ${namespace}: ${socket.id}`);
        
        if (typeof controller.handleConnection === 'function') {
          controller.handleConnection(socket, nsp);
        }
        
        if (typeof controller.registerEvents === 'function') {
          controller.registerEvents(socket, nsp);
        }
        
        socket.on('disconnect', () => {
          if (typeof controller.handleDisconnection === 'function') {
            controller.handleDisconnection(socket);
          } else if (typeof controller.disconnect === 'function') {
            controller.disconnect(socket);
          }
        });
      });
      
      console.log(`Socket controller: ${controllerClass.name} , Namespace: ${namespace} Registered Done 🚀`);
    } catch (error) {
      console.error(`Error setting up Socket controller ${controllerClass.name}:`, error);
    }
  }
}