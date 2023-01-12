import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { User } from '../models/user';
import { Room } from '../models/room';

const Rooms: NextPage = () => {
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const listRooms = () => {
    const newSocket = io(`http://localhost:4000`, {
      query: {
        userName: newUserName,
        language: 'en',
      },
    });
    setSocket(newSocket);

    console.log('sending list rooms to server');
    socket?.emit('listRooms');
    socket?.on('availableRooms', (roomsData: Array<Room>) => {
      console.log('Rooms: ' + roomsData);
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Songguesser</title>
        <meta name="description" content="A song guessing game!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Rooms</h1>

        <button className={styles.connectButton} onClick={() => listRooms()}>
          <p>List Rooms</p>
        </button>
      </main>
    </div>
  );
};

export default Rooms;
