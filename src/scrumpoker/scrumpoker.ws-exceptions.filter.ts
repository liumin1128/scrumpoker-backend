import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient(); // 获取WebSocket客户端对象

    console.log('xxxxxx');
    console.log('xxxxxx');
    console.log('xxxxxx');
    console.log('xxxxxx');
    // 你可以根据需要使用client对象来发送消息
    client.emit('exception', {
      status: 'error',
      message: exception.getError(),
    });
  }
}
