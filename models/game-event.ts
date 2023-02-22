import { ChatMessage } from './chatmessage';
import { CountDown } from './countdown';
import { EVENTS } from './enum/events';
import { Game } from './game';
import { Player } from './players';

class GameEvent {
  eventType!: EVENTS;
  data!: ChatMessage | Player | CountDown;
  game!: Game;
}

export { GameEvent };
