import { User } from './user';

class Player extends User {
  point!: number;
  selectedSong!: string;
  guessedSong!: string;
}

export { Player };
