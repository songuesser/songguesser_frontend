import { GAMESTATE } from './enum/game-state';
import { Player } from './players';

class Game {
  playersJoined!: Player[];
  playersThatShouldJoin!: Player[];
  round!: 0;
  state!: GAMESTATE;
  chat!: string[];
  gameId!: string;
  name!: string;
}

export { Game };
