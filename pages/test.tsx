import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { User } from '../models/user';
import { Room } from '../models/room';
import { NextResponse } from 'next/server';
import Link from 'next/link';

const Home: NextPage = () => {
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const initializeGame = () => {
    if (newUserName == "") {
      console.log("Empty Username")
      return;
    }
    const newSocket = io(`http://localhost:4000`,
      {
        query: {
          "userName": newUserName,
          "language": "en",
        }
      });
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

    //document.location.href = 'rooms'
  };

  const updateUsername = () => {
    if (socket == null) {
      return;
    }

    socket?.emit('setUsername', { userId: clientId, username: newUserName });
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

        <p>Enter your Name!:</p>
        <input
          type={'text'}
          onChange={(e) => setNewUsername(e.target.value)}
          value={newUserName}
        />
        <button 
          className={styles.connectButton}
          onClick={() => initializeGame()}
        >
          <p>Play!</p>
        </button>
      </main>

    </div>
  );
};

export default Home;
