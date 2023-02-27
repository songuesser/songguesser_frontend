import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../context/socket';
import { JoinRoomDTO } from '../dto/joinRoom';
import { RoomsList } from '../dto/listRooms';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { Player } from '../models/players';
import styles from '../styles/RoomPage.module.css';
import { User } from '../models/user';
import { EVENTS } from '../models/enum/events';
import { CreateGameDTO } from '../dto/createGame';

const RoomsPage: NextPage = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomName, setRoomName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [admin, setAdmin] = useState<User>();

  useEffect(() => {
    const id: string = router.query.id as string;
    if (id == undefined) {
      return;
    }

    if (socket == undefined) {
      return;
    }

    setRoomId(id);
    listenToRoomUpdates(id, socket);
    joinRoom(id, socket);
    listenToGameStart(id, socket);

    return () => {
      socket.off(WEBSOCKET_CHANNELS.LIST_ROOMS);
      socket.off(WEBSOCKET_CHANNELS.CREATE_GAME);
    };
  }, [router.query, socket]);

  const joinRoom = (id: string, socket: Socket) => {
    const joinRoomDTO: JoinRoomDTO = {
      roomId: id,
    };

    socket.emit(WEBSOCKET_CHANNELS.JOIN_ROOM, joinRoomDTO);
  };

  const listenToRoomUpdates = (id: string, socket: Socket) => {
    socket.on(WEBSOCKET_CHANNELS.LIST_ROOMS, (data: RoomsList) => {
      const { rooms } = data;
      const room = rooms.find((room) => room.roomId == id);
      if (room == undefined) {
        return;
      }

      setRoomName(room?.roomName);
      setPlayers(room.players);
      setAdmin(room.admin);
    });
  };

  const listenToGameStart = (id: string, socket: Socket) => {
    socket.on(WEBSOCKET_CHANNELS.CREATE_GAME, (event: EVENTS) => {
      if (event == EVENTS.GAME_START) {
        router.push({ pathname: '/game/', query: { id: id } });
      }
    });
  };

  const startGame = () => {
    if (socket == undefined) {
      return;
    }

    const gameToCreate: CreateGameDTO = { roomId, players, roomName };

    socket?.emit(WEBSOCKET_CHANNELS.CREATE_GAME, gameToCreate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.homebutton}>
        <a href="http://localhost:3000">Home</a>
      </div>
      <div className={styles.home}>
        <main className={styles.main}>
          <h1 className={styles.title}>Room: {roomName}</h1>

          <div className={styles.form}>
            <h2 className={styles.detailsInfo}>RoomId: {roomId}</h2>
            {admin?.userId == socket?.id && (
              <button
                className={styles.connectButton}
                onClick={() => startGame()}
              >
                <p>Game start</p>
              </button>
            )}
            <h3 className={styles.detailsInfo}>Players: </h3>
            {players.map((player, key) => {
              return (
                <p className={styles.player} key={key}>
                  {player.username}
                </p>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoomsPage;
