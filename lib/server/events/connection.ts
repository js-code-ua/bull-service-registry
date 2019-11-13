import { Socket } from "socket.io";
import disconnectHandler from './disconnect';
import { Queue } from "bull";

export default (registryQueue: Queue) => function (socket: Socket) {
    socket.on('disconnect', disconnectHandler(socket, registryQueue));
}