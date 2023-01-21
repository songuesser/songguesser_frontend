import { Player } from '../models/players';

class CreateGameDTO {
  players!: Player[];
  roomId!: string;
  roomName!: string;
}

export { CreateGameDTO };
