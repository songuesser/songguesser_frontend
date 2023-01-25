import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/testseitestyle.module.css';
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

  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');

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
      <div className={styles.home}>
      <Head>
        <title>Songguesser</title>
          <div className={styles.logo}></div>
      </Head>
      <div className={styles.main}>
        <div className={styles.content}>
          <h1>
            Softwareprojekt
            <br />
            <span>Songguesser</span>
          </h1>
          <p className={styles.par}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt neque expedita
            atque eveniet <br /> quis nesciunt. Quos nulla vero consequuntur, fugit nemo ad
            delectus <br /> a quae totam ipsa illum minus laudantium?
          </p>
          </div>
          <div className={styles.form}>
            <h2>Dashboard</h2>
            <input type={'text'} onChange={(e) => setNewUsername(e.target.value)} value={newUserName} placeholder="New Username"></input>
            <button className={styles.connectButton} onClick={() => updateUsername()}>Update Username</button>
            <input type={'text'} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Enter Room Name" value={newRoomName}/>
          <button className={styles.connectButton} onClick={() => createRoom()}>
            Create Room
          </button>
            <button className={styles.connectButton} onClick={() => connectToServer()}> Connect to Server </button>
            <p>Status:</p>
          {socket && socket.active ? <p>Connected</p> : <p>Not Connected</p>}
          {socket && socket.active && (
            <p>Current user name: {userName ?? 'hey'}</p>
            
          )}

          </div>
      </div>
      <footer>
        <div className={styles.footer_container}>
          <div className={styles.footer_content}>
          <div className={styles.hdmi}></div>
            <p>Softwareprojekt des Studiengang Medieninformatik</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

