export const queueName = 'bull-service-register';
export const registryKey = 'bull-based-services-registry';
export const registerEvent = (id: string) => `service-synced-${id}`;