import { RegistryEvent, RegisterEventData, DeregisterEventData } from '../../types/registryEvent';
import { Socket } from 'socket.io';
import { Queue } from 'bull';
import { queueAction } from '../../types/queueAction.enum';

export default (socket: Socket, registryQueue: Queue) =>
  async function() {
    const { instanceId, name } = socket.handshake.query;
    await registryQueue.add(
      new RegistryEvent<DeregisterEventData>(queueAction.Deregister, new DeregisterEventData(instanceId, name)),
    );
  };
