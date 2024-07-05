export interface Participant {
  id: string;
  username: string;
  status?: string;
  iAmScrumMaster?: boolean;
  voteValue?: number;
  canVote?: boolean;
  hasVoted?: boolean;
  clientIDs: string[];
}

export interface Room {
  id: string;
  participants: Participant[];
}

export interface UpdateMessageBody {
  id: string;
  user: string;
}

export interface CreateRoomBody {
  username: string;
  roomID: string;
  clientID: string;
}

export interface JoinRoomBody {
  roomID: string;
  username: string;
  clientID: string;
  iAmScrumMaster?: boolean;
}

export interface ConnectRoomBody {
  roomID: string;
  username: string;
  clientID: string;
}

export interface DisconnectBody {
  roomID: string;
  clientID: string;
}

export interface RemoveParticipantBody {
  roomID: string;
  participantID: string;
}

export interface VoteBody {
  roomID: string;
  participantID: string;
  voteValue: number;
}

export interface StartVoteBody {
  roomID: string;
}

export interface Response {
  code: number;
  data?: Room;
  message?: string;
}
