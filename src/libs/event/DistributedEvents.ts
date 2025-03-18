import amqp from 'amqplib';
import EventEmitter from 'eventemitter3';
import { Service } from 'typedi';
import { Logger } from '@footy/fmk/libs/logger';

export type RabbitMQConfig = {
    connection: string;
};

const EVENTS_EXCHANGE = 'BizEvents';
const DEAD_LETTER_EXCHANGE = 'BizEventDeadLetter';
const DEAD_LETTER_QUEUE = 'DeadLetters';
const DEAD_LETTER_ROUTING_KEY = 'DeadLetter';

@Service()
export class DistributedEvents extends EventEmitter {
    private logger = Logger.getLogger(DistributedEvents);

    private channel: amqp.Channel;

    private queueName: string;

    static async open(config: RabbitMQConfig, queueName: string) {
        const conn = await amqp.connect(config.connection);
        const channel = await conn.createChannel();
        const events = new DistributedEvents();
        events.channel = channel;
        events.queueName = queueName;
        await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
                'x-dead-letter-routing-key': DEAD_LETTER_ROUTING_KEY,
            },
        });
        await channel.assertQueue(DEAD_LETTER_QUEUE, {
            durable: true,
        });
        await channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
        await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, DEAD_LETTER_ROUTING_KEY);
        return events;
    }

    async sub(events: string[]) {
        await Promise.all(events.map((event) => this.channel.bindQueue(this.queueName, EVENTS_EXCHANGE, event)));
        this.channel.consume(this.queueName, (msg:any) => {
            if (msg) {
                const eventName = msg.properties.headers['x-eventName'];
                const content = msg.content.toString();
                const data = JSON.parse(content);
                try {
                    this.logger.debug(`Received event: ${eventName}, Content: ${content}`);
                    this.emit('RemoteEvent', eventName, data);
                    this.channel.ack(msg);
                } catch (error) {
                    this.logger.debug(`Message rejected: ${eventName} with error: ${error}`);
                    this.channel.reject(msg, !msg.fields.redelivered);
                }
            }
        });
    }

    async pub<T = unknown>(event: string, data: T) {
        this.channel.publish(EVENTS_EXCHANGE, event, Buffer.from(JSON.stringify(data)), {
            contentEncoding: 'UTF-8',
            contentType: 'text/json',
            deliveryMode: 2,
            headers: {
                'x-eventName': event,
            },
        });
    }

    async close() {
        await this.channel.close();
    }
}