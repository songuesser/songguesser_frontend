import { Player } from './players';
import { User } from './user';

class Room {
  roomName!: string;
  roomId!: string;
  players!: Player[];
  admin!: User;
}

export { Room };
