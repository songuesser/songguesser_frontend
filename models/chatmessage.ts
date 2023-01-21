import { User } from './user';

class ChatMessage {
  id!: string;
  player!: User;
  message!: string;
  time!: string;
}

export { ChatMessage };
