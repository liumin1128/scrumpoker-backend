import { Injectable } from '@nestjs/common';
import {
  Room,
  Participant,
  CreateRoomBody,
  JoinRoomBody,
  RemoveParticipantBody,
  VoteBody,
  StartVoteBody,
  DisconnectBody,
  ConnectRoomBody,
} from './scrumpoker.interface';
import { v4 as uuidv4 } from 'uuid';
import * as loki from 'lokijs';

@Injectable()
export class ScrumpokerService {
  db: any;
  rooms: any;

  constructor() {
    this.rooms = {};
    this.db = new loki('example.db');
    this.rooms = this.db.addCollection('rooms');
  }

  // 创建房间
  createRoom(data: CreateRoomBody): Room {
    const participant: Participant = {
      id: uuidv4(),
      username: data.username,
      iAmScrumMaster: true,
      canVote: false,
      status: 'online',
      clientIDs: [],
    };

    const room: Room = {
      id: data.roomID,
      participants: [participant],
    };

    this.rooms.insert(room);

    return room;
  }

  // 加入房间
  async joinRoom(data: JoinRoomBody): Promise<Room> {
    let room = await this.rooms.findOne({ id: data.roomID });

    const participant: Participant = {
      id: uuidv4(),
      username: data.username,
      iAmScrumMaster: data.iAmScrumMaster,
      canVote: !data.iAmScrumMaster,
      status: 'offline',
      clientIDs: [],
    };

    // 如果不存在直接创建room
    if (!room) {
      room = {
        id: data.roomID,
        participants: [participant],
      };
      await this.rooms.insert(room);
      return room;
    }

    // 如果存在更新room
    room.participants = [...room.participants, participant];
    this.rooms.update(room);

    return room;
  }

  // 加入房间
  async connectRoom(data: ConnectRoomBody): Promise<Room> {
    const room = await this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participantIndex = room.participants.findIndex(
      (i) => i.username === data.username,
    );

    if (participantIndex === -1) {
      throw new Error('participant not found');
    }

    room.participants[participantIndex].status = 'online';

    room.participants[participantIndex].clientIDs = [
      ...room.participants[participantIndex].clientIDs,
      data.clientID,
    ];

    console.log('disconnect room');
    console.log(room);

    this.rooms.update(room);

    return room;
  }

  // 离开房间
  async disconnect(data: DisconnectBody): Promise<Room> {
    const room = await this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participantIndex = room.participants.findIndex(
      (i) => i.clientIDs.findIndex((j) => j === data.clientID) !== -1,
    );

    if (participantIndex === -1) {
      throw new Error('participant not found');
    }

    room.participants[participantIndex].clientIDs = room.participants[
      participantIndex
    ].clientIDs.filter((item) => item !== data.clientID);

    if (room.participants[participantIndex].clientIDs.length === 0) {
      room.participants[participantIndex].status = 'offline';
    }

    console.log('disconnect room');
    console.log(room);

    this.rooms.update(room);

    return room;
  }

  // 移除成员
  removeParticipant(data: RemoveParticipantBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participantIndex = room.Participants.findIndex(
      (i) => i.id === data.participantID,
    );

    if (participantIndex === -1) {
      throw new Error('participant not found');
    }

    room.participants = room.Participants.splice(participantIndex, 1);
    console.log('room:', room);

    this.rooms.update(room);

    return room;
  }

  // 开始投票
  startVote(data: StartVoteBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participants = room.participants.map((i) => {
      return {
        ...i,
        hasVoted: false,
      };
    });

    room.participants = participants;

    this.rooms.update(room);

    return room;
  }

  vote(data: VoteBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participantIndex = room.Participants.findIndex(
      (i) => i.id === data.participantID,
    );

    if (participantIndex === -1) {
      throw new Error('participant not found');
    }

    const participant: Participant = room.participants[participantIndex];
    participant.voteValue = data.voteValue;
    participant.hasVoted = true;
    room.participants[participantIndex] = participant;
    console.log('room:', room);

    this.rooms.update(room);

    return room;
  }

  getRoom(id: string): Room {
    return this.rooms[id];
  }
}
