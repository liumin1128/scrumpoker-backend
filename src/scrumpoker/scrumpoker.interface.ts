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
  status: string;
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
  username: string;
}

export interface VotingBody {
  roomID: string;
  username: string;
  voteValue: number;
}

export interface StartVotingBody {
  roomID: string;
}

export interface EndVotingBody {
  roomID: string;
}

export interface Response {
  code: number;
  data?: Room;
  message?: string;
}
