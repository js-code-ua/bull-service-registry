// {redis: {port: 6379, host: '127.0.0.1', password: 'foobared'}}
export interface redisOptions {
    port: number,
    host: string,
    password?: string,
}