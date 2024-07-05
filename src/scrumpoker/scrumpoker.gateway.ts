import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
  ConnectedSocket,
} from '@nestjs/websockets';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { ScrumpokerService } from './scrumpoker.service';
import {
  CreateRoomBody,
  ConnectRoomBody,
  Room,
  StartVoteBody,
  VoteBody,
  RemoveParticipantBody,
  Response,
} from './scrumpoker.interface';

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
    console.log('Client connected:', client);
    return;
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('Client disconnected:', client);
    console.log('Client disconnected:', client.id);

    try {
      const roomID = client.handshake.query.roomID as string;
      const room = await this.scrumpokerService.disconnect({
        roomID: roomID,
        clientID: client.id,
      });

      client.to(roomID).emit('update', room);
    } catch (error) {
      console.log('error');
      console.log(error);
    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() data: CreateRoomBody,
    @ConnectedSocket() client: Socket,
  ): Promise<Room> {
    console.log('createRoom:', client.id, data);
    data.clientID = client.id;
    const room = this.scrumpokerService.createRoom(data);

    client.join(data.roomID);
    return room;
  }

  @SubscribeMessage('connectRoom')
  async connectRoom(
    @MessageBody() data: ConnectRoomBody,
    @ConnectedSocket() client: Socket,
  ): Promise<Response> {
    console.log('connectRoom:', client, data);

    const { roomID } = data;
    data.clientID = client.id;

    try {
      const room = await this.scrumpokerService.connectRoom(data);
      client.join(roomID);
      client.to(roomID).emit('update', room);
      return { code: 200, data: room };
    } catch (error) {
      console.log('error:', error);
      client.to(roomID).emit('message', error.message);
      return { code: 401, message: error.message };
    }
  }

  @SubscribeMessage('startVote')
  async startVote(@MessageBody() data: StartVoteBody): Promise<Room> {
    const room = this.scrumpokerService.startVote(data);
    this.updateRoom(room);
    return room;
  }

  @SubscribeMessage('vote')
  async vote(@MessageBody() data: VoteBody): Promise<Room> {
    const room = this.scrumpokerService.vote(data);
    this.updateRoom(room);
    return room;
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(
    @MessageBody() data: RemoveParticipantBody,
  ): Promise<Room> {
    const room = this.scrumpokerService.removeParticipant(data);
    this.updateRoom(room);
    return room;
  }

  // @SubscribeMessage('clearRoom')
  // async clearRoom(@MessageBody() data: ClearRoomBody): Promise<Room> {
  //   const room = this.scrumpokerService.clearRoom(data);
  //   this.updateRoom(room);
  //   return room;
  // }
}
