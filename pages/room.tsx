import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../context/socket';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { RoomsList } from '../dto/listRooms';
import { useRouter } from 'next/router';
import { Player } from '../models/players';
import { Socket, io } from 'socket.io-client';
import { Room } from '../models/room';
import { JoinRoomDTO } from '../dto/joinRoom';

const RoomsPage: NextPage = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomName, setRoomName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');

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

    return () => {
      socket.off(WEBSOCKET_CHANNELS.LIST_ROOMS);
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
    });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Room: {roomName}</h1>
        <h2>RoomId: {roomId}</h2>
        {players.map((player, key) => {
          return <p key={key}>{player.username}</p>;
        })}
      </main>
    </div>
  );
};

export default RoomsPage;
