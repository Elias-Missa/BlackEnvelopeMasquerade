export interface Room {
  id: string;
  code: string;
  status: "waiting" | "revealed";
  host_token: string;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  number: number | null;
  created_at: string;
}

export interface GameResult {
  players: Player[];
  average: number;
  twoThirds: number;
  winners: Player[];
}
