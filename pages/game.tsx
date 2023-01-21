import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../context/socket';
import { JoinRoomDTO } from '../dto/joinRoom';
import { RoomsList } from '../dto/listRooms';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { Player } from '../models/players';
import styles from '../styles/Home.module.css';
import { ChatMessage } from '../models/chatmessage';
import { SendMessageDTO } from '../dto/sendMessage';
import { EVENTS } from '../models/enum/events';
import { GameEvent } from '../models/game-event';
import { Game } from '../models/game';

const GamePage: NextPage = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameInformation, setGameInformation] = useState<Game>();
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const id: string = router.query.id as string;
    if (id == undefined) {
      return;
    }

    if (socket == undefined) {
      return;
    }

    setRoomId(id);
    listenToGameUpdates(socket);
    sendPlayerJoinedEvent(socket, id);

    return () => {
      socket.off(WEBSOCKET_CHANNELS.LIST_ROOMS);
    };
  }, [router.query, socket]);

  const sendPlayerJoinedEvent = (socket: Socket, id: string) => {
    if (socket == undefined) {
      return;
    }

    const assingPlayerDTO = { userId: socket.id, roomId: id };
    console.log('Player join');
    socket.emit(WEBSOCKET_CHANNELS.IN_GAME_JOIN_PLAYER, assingPlayerDTO);
  };

  const listenToGameUpdates = (socket: Socket) => {
    if (socket == undefined) {
      return;
    }
    socket.on(WEBSOCKET_CHANNELS.IN_GAME, (event: GameEvent) =>
      handleGameEvents(event),
    );
  };

  const handleGameEvents = (event: GameEvent) => {
    console.log('Event received of type' + event.eventType);
    setGameInformation(event.game);
    switch (event.eventType) {
      case EVENTS.MESSAGE:
        const newMessage = event.data as ChatMessage;
        setMessages((old) => [...old, newMessage]);
        break;
      case EVENTS.PLAYER_JOINED:
        const newPlayer = event.data as Player;
        setPlayers((old) => [...old, newPlayer]);
        break;
    }
  };

  const sendMessage = () => {
    if (socket == undefined) {
      return;
    }

    const sendMessageDTO: SendMessageDTO = {
      message: message,
      roomId: roomId,
      userId: socket.id,
    };

    socket?.emit(WEBSOCKET_CHANNELS.IN_GAME_CHAT, sendMessageDTO);
    setMessage('');
  };

  const displayPlayerCount = (): string => {
    return (
      gameInformation?.playersJoined.length +
      ' / ' +
      gameInformation?.playersThatShouldJoin.length
    );
  };

  const showMessages = (messages: ChatMessage[]): ChatMessage[] => {
    const filteredMessage = messages.filter((message, index, self) => {
      return index === self.findIndex((m) => m.id === message.id);
    });

    return filteredMessage;
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Game: {gameInformation?.name ?? 'Loading...'}
        </h1>
        <h2>Players: {displayPlayerCount() ?? 'Loading...'}</h2>
        {gameInformation?.playersJoined.map((player, key) => {
          return <p key={key}>{player.username}</p>;
        })}
        <h2>Chat</h2>
        {showMessages(messages).map((chatMsg, key) => {
          return <p key={key}>{chatMsg.message}</p>;
        })}
        Enter new message:
        <input onChange={(e) => setMessage(e.target.value)} value={message} />
        <button onClick={() => sendMessage()}>
          <p>Send message</p>
        </button>
      </main>
    </div>
  );
};

export default GamePage;
