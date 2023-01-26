import { Player } from './players';

class CountDown {
  totalTime!: number;
  currentTime!: number;
  message!: string;
  currentlySelectedPlayer?: Player;
}

export { CountDown };
