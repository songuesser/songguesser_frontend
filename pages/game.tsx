import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../context/socket';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { Player } from '../models/players';
import styles from '../styles/GamePage.module.css';
import { ChatMessage } from '../models/chatmessage';
import { SendMessageDTO } from '../dto/sendMessage';
import { EVENTS } from '../models/enum/events';
import { GameEvent } from '../models/game-event';
import { Game } from '../models/game';
import { CountDown } from '../models/countdown';
import { GAMESTATE } from '../models/enum/game-state';
import { Song } from '../models/song';
import { SelectSongDTO } from '../dto/selectSong';
import Spotify from 'react-spotify-embed';
import { LeaveRoomDTO } from '../dto/leaveRoom';

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

        setCountDownTotal(countdown.totalTime);
        setCountDownCurrent(countdown.currentTime);
        setCountDownMessage(countdown.message);
        setCurrentSelectedPlayer(countdown.currentlySelectedPlayer);
        break;
      case EVENTS.PLAYER_LEFT:
        const leavingPlayer = event.data as Player;
        //cleanUpLeavingPlayer(leavingPlayer);
        //displayPlayerCount();
        break;
      case EVENTS.END:
        setCountDownTotal(0);
        setCountDownCurrent(0);
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
        return 'Select a song';
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

  const getURI = (): string => {
    if (currentPlayer == undefined) {
      return '';
    }

    const playersSelectedSong = gameInformation?.playersJoined.find(
      (player) => currentPlayer.userId == player.userId,
    )?.selectedSong;

    const trackId = playersSelectedSong?.uri.substring(
      playersSelectedSong?.uri.indexOf(':track:') + ':track:'.length,
    );

    return trackId ?? '';
  };

  const leaveRoom = (): void => {
    const leavingPlayer = players.find((user) => user.userId == socket?.id);

    let leaveRoomDTO: LeaveRoomDTO;
    if (leavingPlayer !== undefined) {
      leaveRoomDTO = {
        player: leavingPlayer,
        roomId: roomId,
      };
      socket?.emit(WEBSOCKET_CHANNELS.LEAVE_ROOM, leaveRoomDTO);
      router.push({ pathname: '/lobby' });
    }
  };

  const cleanUpLeavingPlayer = (leavingPlayer: Player): void => {
    const playersIndex = players.findIndex(
      (user) => user.userId == leavingPlayer.userId,
    );
    const playersJoinedIndex = gameInformation?.playersJoined.findIndex(
      (user) => user.userId == leavingPlayer.userId,
    );

    players.splice(playersIndex, 1);
    if (playersJoinedIndex !== undefined) {
      gameInformation?.playersJoined.splice(playersJoinedIndex, 1);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Game: {gameInformation?.name ?? 'Loading...'}
        </h1>
        <div className={styles.form}>
          <h2>{displayGameStates(gameInformation?.state)}</h2>
          {countdownCurrent != 0 && (
            <p>
              {countdownMessage}: {countdownCurrent + ' / ' + countdownTotal}
            </p>
          )}
        </div>
        <div className={styles.bigItemsContainer}>
          <div className={styles.form}>
            <h2>Players: {displayPlayerCount() ?? 'Loading...'}</h2>
            {gameInformation?.playersJoined.map((player, key) => {
              return (
                <p className={styles.player} key={key}>
                  {player.username}
                </p>
              );
            })}
            <button
              className={styles.connectButton}
              onClick={() => leaveRoom()}
            >
              Leave room
            </button>
          </div>
          {gameInformation?.state == GAMESTATE.GUESSING && (
            <div className={styles.musicContainer}>
              <div className={styles.miniForm}>
                <h2>Guess song in the chat</h2>
                {getURI() === '' && <p></p>}
              </div>
              {getURI() != '' && (
                <div className={styles.hiderContainer}>
                  <div className={styles.hideOne} />
                  <div className={styles.hideTwo} />
                  <Spotify
                    wide
                    link={'https://open.spotify.com/track/' + getURI()}
                  />
                </div>
              )}
            </div>
          )}
          {gameInformation?.state == GAMESTATE.SELECTING && (
            <div className={styles.form}>
              <h2>Search for your song</h2>
              <input
                onChange={(e) => setRequestedSong(e.target.value)}
                value={requestedSong}
              />
              <button
                className={styles.connectButton}
                onClick={() => searchForSong()}
              >
                Search for matching songs
              </button>

              {matchingSongs.map((song, key) => (
                <button
                  key={key}
                  className={styles.music}
                  onClick={() => selectSong(song)}
                >
                  {song.name} by {song.artist}
                </button>
              ))}
            </div>
          )}

          <div className={styles.form}>
            <h2>Chat</h2>
            <div className={styles.chatContainer}>
              <input
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Enter new message"
              />
              <div className={styles.chatButton}>
                <button onClick={() => sendMessage()}>
                  <p>Send message</p>
                </button>
              </div>
              {showMessages(messages).map((chatMsg, key) => {
                return <p key={key}>{chatMsg.message}</p>;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
