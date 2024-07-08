import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { UseFilters } from '@nestjs/common';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { ScrumpokerService } from './scrumpoker.service';
import {
  ConnectRoomBody,
  Room,
  StartVotingBody,
  EndVotingBody,
  VotingBody,
  RemoveParticipantBody,
  Response,
} from './scrumpoker.interface';

import { WsExceptionFilter } from './scrumpoker.ws-exceptions.filter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private readonly scrumpokerService: ScrumpokerService) {}

  @WebSocketServer()
  server: Server;

  // 当需要向特定房间发送消息时
  updateRoom(room: Room) {
    this.server.to('123456').emit('update', room);
  }

  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(
  //     map((item) => ({ event: 'events', data: item })),
  //   );
  // }

  @SubscribeMessage('connection')
  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('Client connected:', client.id);
    return;
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('Client disconnected:', client.id);

    try {
      const roomID = client.handshake.query.roomID as string;
      const room = await this.scrumpokerService.disconnect({
        roomID: roomID,
        clientID: client.id,
      });

      client.to(roomID).emit('update', room);
    } catch (error) {
      console.log(error.message);
    }
  }

  @SubscribeMessage('connectRoom')
  async connectRoom(
    @MessageBody() data: ConnectRoomBody,
    @ConnectedSocket() client: Socket,
  ): Promise<Response> {
    console.log('connectRoom:', client.id);

    const { roomID } = data;
    data.clientID = client.id;

    try {
      const room = await this.scrumpokerService.connectRoom(data);
      client.join(roomID);
      client.to(roomID).emit('update', room);
      return { code: 200, data: room };
    } catch (error) {
      console.log('error:', error.message);
      client.to(roomID).emit('message', error.message);
      return { code: 401, message: error.message };
    }
  }

  @SubscribeMessage('startVoting')
  async startVoting(@MessageBody() data: StartVotingBody): Promise<Room> {
    try {
      const room = this.scrumpokerService.startVoting(data);
      this.updateRoom(room);
      return room;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('endVoting')
  async endVoting(@MessageBody() data: EndVotingBody): Promise<Room> {
    try {
      const room = this.scrumpokerService.endVoting(data);
      this.updateRoom(room);
      return room;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('voting')
  async voting(@MessageBody() data: VotingBody): Promise<Room> {
    try {
      const room = await this.scrumpokerService.voting(data);
      this.updateRoom(room);
      return room;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(
    @MessageBody() data: RemoveParticipantBody,
  ): Promise<Room> {
    const room = this.scrumpokerService.removeParticipant(data);
    this.updateRoom(room);
    return room;
  }
}
