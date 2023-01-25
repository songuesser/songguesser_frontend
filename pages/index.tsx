import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { User } from '../models/user';
import { Room } from '../models/room';

const Home: NextPage = () => {
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectToServer = () => {
    
    const newSocket = io(`http://localhost:4000`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected');
    });

    newSocket.on('accountCreated', (userData: User) => {
      console.log('accountCreated', userData);
      setUsername(userData.username);
      setClientId(userData.userId);
    });

    newSocket.on('setUsername', (newUserName: string) => {
      console.log('setUsername', newUserName);
      setUsername(newUserName);
    });
  };

  const updateUsername = () => {
    if (socket == null) {
      return;
    }

    socket?.emit('setUsername', { userId: clientId, username: newUserName });
  };

  const createRoom = () => {
    if (socket == null) {
      return;
    }

    socket?.emit('createRoom', { clientId: clientId, roomName: newRoomName });
    socket?.on('roomCreated', (roomData: Room) => {
      setRoomName(roomData.roomName);
      setRoomId(roomData.roomId);

      console.log("Frontend: Room Created with Name: " + roomName + " and ID: " + roomId)
    })

  };


  return (
    <div className={styles.container}>
      <Head>
        <title>Songguesser</title>
        <meta name="description" content="A song guessing game!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Songguesser!</h1>
        <button
          className={styles.connectButton}
          onClick={() => connectToServer()}
        >
          <p>Connect to server</p>
        </button>
        <p>Update username below:</p>
        <input
          type={'text'}
          onChange={(e) => setNewUsername(e.target.value)}
          value={newUserName}
        />
        <button
          className={styles.connectButton}
          onClick={() => updateUsername()}
        >
          <p>Update username</p>
        </button>
        <p>Status:</p>
        {socket && socket.active ? <p>Connected</p> : <p>Not Connected</p>}
        {socket && socket.active && (
          <p>Current user name: {userName ?? 'hey'}</p>
        )}
        <p>Enter Room Name:</p>
        <input
          type={'text'}
          onChange={(e) => setNewRoomName(e.target.value)}
          value={newRoomName}
        />
        <button
          className={styles.connectButton}
          onClick={() => createRoom()}
        >
          <p>Create Room</p>
        </button>
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  );
};

export default Home;
