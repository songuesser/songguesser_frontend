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
    console.log('JOIN ROOM');
    const joinRoomDTO: JoinRoomDTO = {
      roomId: id,
    };

    socket.emit(WEBSOCKET_CHANNELS.JOIN_ROOM, joinRoomDTO);
  };

  const listenToRoomUpdates = (id: string, socket: Socket) => {
    socket.on(WEBSOCKET_CHANNELS.LIST_ROOMS, (data: RoomsList) => {
      console.log('ROOM UDPATES');

      const { rooms } = data;
      console.log(rooms);
      const room = rooms.find((room) => room.roomId == id);
      console.log(room);
      if (room == undefined) {
        return;
      }

      setRoomName(room?.roomName);
      setPlayers(room.players);
      setAdmin(room.admin);
    });
  };

  const listenToGameStart = (id: string, socket: Socket) => {
    console.log('Listening to game start');
    socket.on(WEBSOCKET_CHANNELS.CREATE_GAME, (event: EVENTS) => {
      console.log('Game start event received');
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

    console.log('start game sent');
    socket?.emit(WEBSOCKET_CHANNELS.CREATE_GAME, gameToCreate);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Room: {roomName}</h1>
        {admin?.userId == socket?.id && (
          <button onClick={() => startGame()}>
            <p>Game start</p>
          </button>
        )}
        <h2>RoomId: {roomId}</h2>
        {players.map((player, key) => {
          return <p key={key}>{player.username}</p>;
        })}
      </main>
    </div>
  );
};

export default RoomsPage;
