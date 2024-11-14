import { Injectable } from '@nestjs/common';
import {
  Room,
  Participant,
  EndVotingBody,
  JoinRoomBody,
  RemoveParticipantBody,
  VotingBody,
  StartVotingBody,
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
    console.log('init scrumpoker service');
    this.rooms = {};
    this.db = new loki('example.db');
    this.rooms = this.db.addCollection('rooms');
  }

  // 加入房间
  async joinRoom(data: JoinRoomBody): Promise<Room> {
    let room = await this.rooms.findOne({ id: data.roomID });

    // 如果不存在直接创建room
    if (!room) {
      const participant: Participant = {
        id: uuidv4(),
        username: data.username,
        iAmScrumMaster: data.iAmScrumMaster,
        canVote: !data.iAmScrumMaster,
        status: 'offline',
        clientIDs: [],
        voteValue: 0,
        hasVoted: false,
      };

      room = {
        id: data.roomID,
        participants: [participant],
      };

      await this.rooms.insert(room);

      return room;
    }

    let participant: Participant;
    participant = room.participants.find((i) => i.username === data.username);

    if (!participant) {
      participant = {
        id: uuidv4(),
        username: data.username,
        iAmScrumMaster: data.iAmScrumMaster,
        canVote: !data.iAmScrumMaster,
        status: 'offline',
        clientIDs: [],
        voteValue: 0,
        hasVoted: false,
      };

      // 如果存在更新room
      room.participants = [...room.participants, participant];
      this.rooms.update(room);
    }

    return room;
  }

  // 加入房间
  async connectRoom(data: ConnectRoomBody): Promise<Room> {
    const room = await this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const pId = room.participants.findIndex(
      (i) => i.username === data.username,
    );

    if (pId === -1) {
      throw new Error('participant not found');
    }

    room.participants[pId].status = 'online';

    room.participants[pId].clientIDs = [
      ...room.participants[pId].clientIDs,
      data.clientID,
    ];

    this.rooms.update(room);

    return room;
  }

  // 离开房间
  async disconnect(data: DisconnectBody): Promise<Room> {
    const room = await this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const pId = room.participants.findIndex(
      (i) => i.clientIDs.findIndex((j) => j === data.clientID) !== -1,
    );

    if (pId === -1) {
      throw new Error('participant not found');
    }

    room.participants[pId].clientIDs = room.participants[pId].clientIDs.filter(
      (item) => item !== data.clientID,
    );

    if (room.participants[pId].clientIDs.length === 0) {
      room.participants[pId].status = 'offline';
    }

    this.rooms.update(room);

    return room;
  }

  // 移除成员
  removeParticipant(data: RemoveParticipantBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const pId = room.participants.findIndex((i) => i.id === data.uID);

    if (pId === -1) {
      throw new Error('participant not found');
    }

    room.participants.splice(pId, 1);

    this.rooms.update(room);

    return room;
  }

  // 开始投票
  startVoting(data: StartVotingBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    const participants = room.participants.map((i) => {
      return {
        ...i,
        hasVoted: false,
        voteValue: 0,
      };
    });

    room.participants = participants;

    room.status = 'voting';

    this.rooms.update(room);

    return room;
  }

  // 结束投票
  endVoting(data: EndVotingBody): Room {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    room.status = 'voted';

    this.rooms.update(room);

    return room;
  }

  async voting(data: VotingBody): Promise<Room> {
    const room = this.rooms.findOne({ id: data.roomID });

    if (!room) {
      throw new Error('room not found');
    }

    if (room.status !== 'voting') {
      throw new Error('can not vote now');
    }

    const pId = room.participants.findIndex(
      (i) => i.username === data.username,
    );

    if (pId === -1) {
      throw new Error('participant not found');
    }

    room.participants[pId].voteValue = data.voteValue;
    room.participants[pId].hasVoted = true;

    if (
      room.participants.filter((i) => i.canVote && !i.hasVoted).length === 0
    ) {
      room.status = 'voted';
    }

    this.rooms.update(room);

    return room;
  }

  getRoom(id: string): Room {
    return this.rooms[id];
  }
}
