import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import Home from '.';
import { SocketContext } from '../context/socket';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { Room } from '../models/room';
import { User } from '../models/user';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import { RoomsList } from '../dto/listRooms';

const Lobby: NextPage = () => {
  const router = useRouter();
  const socket = useContext<Socket | undefined>(SocketContext);
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [openRooms, setOpenRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (socket == undefined) {
      // TODO: Error when socket is not connected
      return;
    }

    listenToRoomUpdates(socket);

    return () => {
      socket.off(WEBSOCKET_CHANNELS.CREATE_ACCOUNT);
      socket.off(WEBSOCKET_CHANNELS.SET_USERNAME);
      socket.off(WEBSOCKET_CHANNELS.LIST_ROOMS);
    };
  }, [socket]);

  const createAccount = () => {
    socket?.emit(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, {
      username: newUserName,
    });

    socket?.on(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, (userData: User) => {
      console.log(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, userData);
      setUsername(userData.username);
      setClientId(userData.userId);
      setNewUsername(userData.username);
    });
  };

  const updateUsername = () => {
    if (socket == undefined) {
      return;
    }

    socket.emit(WEBSOCKET_CHANNELS.SET_USERNAME, {
      userId: clientId,
      username: newUserName,
    });

    socket.on(WEBSOCKET_CHANNELS.SET_USERNAME, (newUserName: string) => {
      console.log(WEBSOCKET_CHANNELS.SET_USERNAME, newUserName);
      setUsername(newUserName);
    });
  };

  const createRoom = () => {
    if (socket == undefined) {
      return;
    }

    socket?.emit(WEBSOCKET_CHANNELS.CREATE_ROOM, {
      clientId: clientId,
      roomName: newRoomName,
    });

    socket?.on(WEBSOCKET_CHANNELS.CREATE_ROOM, (roomData: Room) => {
      setRoomName(roomData.roomName);
      setRoomId(roomData.roomId);

      pushToRoom(roomData.roomId);

      console.log(
        'Frontend: Room Created with Name: ' + roomName + ' and ID: ' + roomId,
      );
    });
  };

  const listenToRoomUpdates = (socket: Socket) => {
    socket.on(WEBSOCKET_CHANNELS.LIST_ROOMS, (data: RoomsList) => {
      console.log('ROOM UDPATES');
      setOpenRooms(data.rooms);
    });
  };

  const pushToRoom = (roomId: string) => {
    router.push({ pathname: '/room/', query: { id: roomId } });
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Create or join game!</h1>
      <p>Enter username below:</p>
      <input
        type={'text'}
        onChange={(e) => setNewUsername(e.target.value)}
        value={newUserName}
      />
      <button
        className={styles.connectButton}
        onClick={() => (userName == '' ? createAccount() : updateUsername())}
      >
        <p>{userName == '' ? 'Create account' : 'Update username'}</p>
      </button>
      <p>Status:</p>
      {socket && socket.active ? <p>Connected</p> : <p>Not Connected</p>}
      {socket && socket.active && <p>Current user name: {userName ?? 'hey'}</p>}
      <p>Enter Room Name:</p>
      <input
        type={'text'}
        onChange={(e) => setNewRoomName(e.target.value)}
        value={newRoomName}
      />
      <button className={styles.connectButton} onClick={() => createRoom()}>
        <p>Create Room</p>
      </button>
      <h2>Open rooms:</h2>
      {openRooms.map((room, key) => {
        return (
          <div key={key}>
            <p>{room.roomName}</p>
            <button onClick={() => pushToRoom(room.roomId)}>
              <p>Connect</p>
            </button>
          </div>
        );
      })}
    </main>
  );
};

export default Lobby;
