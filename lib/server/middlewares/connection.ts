export default function(socket: SocketIO.Socket, next: Function) {
  const { instanceId, name } = socket.handshake.query;
  if (instanceId && name) {
    return next();
  }
  if (!instanceId) {
    return next(new Error('instanceId is required'));
  }
  return next(new Error('name is required'));
}
