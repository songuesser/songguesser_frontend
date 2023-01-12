import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import Home from '.';
import { SocketContext } from '../context/socket';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { User } from '../models/user';
import styles from '../styles/Home.module.css';

const Lobby: NextPage = () => {
  const socket = useContext<Socket | undefined>(SocketContext);
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    if (socket == undefined) {
      console.log('SOCKET UNDEFINED');
      return;
    }
    return () => {
      socket.off(WEBSOCKET_CHANNELS.CREATE_ACCOUNT);
      socket.off(WEBSOCKET_CHANNELS.SETUSERNAME);
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

    socket.emit(WEBSOCKET_CHANNELS.SETUSERNAME, {
      userId: clientId,
      username: newUserName,
    });

    socket.on(WEBSOCKET_CHANNELS.SETUSERNAME, (newUserName: string) => {
      console.log(WEBSOCKET_CHANNELS.SETUSERNAME, newUserName);
      setUsername(newUserName);
    });
  };

  const createRoom = () => {
    if (socket == undefined) {
      return;
    }
  };

  //   socket?.emit('createRoom', { clientId: clientId, roomName: newRoomName });
  //   socket?.on('roomCreated', (roomData: Room) => {
  //     setRoomName(roomData.roomName);
  //     setRoomId(roomData.roomId);

  //     console.log(
  //       'Frontend: Room Created with Name: ' + roomName + ' and ID: ' + roomId,
  //     );
  //   });
  // };

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
    </main>
  );
};

export default Lobby;
