export default (socket: SocketIO.Socket, next: Function) => {
    let instanceId = socket.handshake.query.instanceId;
    if (instanceId) {
      return next();
    }
    return next(new Error('instanceId is required'));
  }