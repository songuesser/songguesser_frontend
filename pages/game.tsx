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
import { CountDown } from '../models/countdown';
import { GAMESTATE } from '../models/enum/game-state';
import { Song } from '../models/song';
import { SelectSongDTO } from '../dto/selectSong';

const GamePage: NextPage = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameInformation, setGameInformation] = useState<Game>();
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [countdownTotal, setCountDownTotal] = useState<number>(0);
  const [countdownCurrent, setCountDownCurrent] = useState<number>(0);
  const [countdownMessage, setCountDownMessage] = useState<string>('');
  const [requestedSong, setRequestedSong] = useState<string>('');
  const [matchingSongs, setMatchingSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | undefined>();
  const [currentPlayer, setCurrentSelectedPlayer] = useState<
    Player | undefined
  >();

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
    receiveMatchingSongs(socket);

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
    setSelectedSong(undefined);

    switch (event.eventType) {
      case EVENTS.MESSAGE:
        const newMessage = event.data as ChatMessage;
        setMessages((old) => [...old, newMessage]);
        break;
      case EVENTS.PLAYER_JOINED:
        const newPlayer = event.data as Player;
        setPlayers((old) => [...old, newPlayer]);
        break;
      case EVENTS.COUNTDOWN:
        const countdown = event.data as CountDown;
        console.log(countdown);
        setCountDownTotal(countdown.totalTime);
        setCountDownCurrent(countdown.currentTime);
        setCountDownMessage(countdown.message);
        setCurrentSelectedPlayer(countdown.currentlySelectedPlayer);
        break;
      case EVENTS.END:
        setCountDownTotal(0);
        setCountDownCurrent(0);
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
      userIdOfPersonThatSelectedSong: currentPlayer?.userId ?? '',
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

  const displayGameStates = (state?: GAMESTATE): string => {
    switch (state) {
      case GAMESTATE.GUESSING:
        return 'Guessing time';
      case GAMESTATE.SELECTING:
        return 'Select the song';
      case GAMESTATE.END:
        return 'Game is over';
      default:
        return '';
    }
  };

  const searchForSong = () => {
    if (socket == undefined) {
      return;
    }

    socket?.emit(WEBSOCKET_CHANNELS.MATCHING_SONGS, requestedSong);
  };

  const receiveMatchingSongs = (socket: Socket) => {
    socket?.on(WEBSOCKET_CHANNELS.MATCHING_SONGS, (data: Song[]) => {
      setMatchingSongs(data);
    });
  };

  const selectSong = (song: Song) => {
    if (socket == undefined) {
      return;
    }
    setSelectedSong(song);

    const selectSongDTO: SelectSongDTO = {
      song: song,
      gameId: gameInformation?.gameId ?? '',
      userId: socket.id,
    };

    socket?.emit(WEBSOCKET_CHANNELS.SELECT_SONG, selectSongDTO);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Game: {gameInformation?.name ?? 'Loading...'}
        </h1>
        <h2>{displayGameStates(gameInformation?.state)}</h2>
        {countdownCurrent != 0 && (
          <p>
            {countdownMessage}: {countdownCurrent + ' / ' + countdownTotal}
          </p>
        )}
        <h2>Players: {displayPlayerCount() ?? 'Loading...'}</h2>
        {gameInformation?.playersJoined.map((player, key) => {
          return <p key={key}>{player.username}</p>;
        })}
        {gameInformation?.state == GAMESTATE.SELECTING && (
          <>
            <h2>Search for your song</h2>
            <input
              onChange={(e) => setRequestedSong(e.target.value)}
              value={requestedSong}
            />
            <button onClick={() => searchForSong()}>
              Search for matching songs
            </button>
            <ul>
              {matchingSongs.map((song, index) => (
                <li key={index}>
                  <button onClick={() => selectSong(song)}>
                    {song.name} by {song.artist}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <h2>Chat</h2>
        Enter new message:
        <input onChange={(e) => setMessage(e.target.value)} value={message} />
        <button onClick={() => sendMessage()}>
          <p>Send message</p>
        </button>
        {showMessages(messages).map((chatMsg, key) => {
          return <p key={key}>{chatMsg.message}</p>;
        })}
      </main>
    </div>
  );
};

export default GamePage;
