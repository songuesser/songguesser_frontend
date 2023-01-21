import { ChatMessage } from './chatmessage';
import { EVENTS } from './enum/events';
import { Game } from './game';
import { Player } from './players';

class GameEvent {
  eventType!: EVENTS;
  data!: ChatMessage | Player;
  game!: Game;
}

export { GameEvent };
