import { Song } from './song';
import { User } from './user';

class Player extends User {
  points!: number;
  selectedSong!: Song | undefined;
  guessedSong!: Song | undefined;
  hasGuessed!: boolean;
}

export { Player };
