import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { User } from '../models/user';
import { Room } from '../models/room';
import useSpotifyWebPlayback from 'react-spotify-web-playback';

const Home: NextPage = () => {
  const [userName, setUsername] = useState<string>('');
  const [newUserName, setNewUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [requestedSong, setRequestedSong] = useState<string>('');
  const [matchingSongs, setMatchingSongs] = useState<any[]>([]);
  const [showList, setShowList] = useState(true);


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

  const playGivenSong = () => {

    socket?.emit('playGivenSong', requestedSong);
    console.log("sending: " + requestedSong)

  };

  const getMatchingSongList = () => {
    socket?.emit('getMatchingSongList', requestedSong);
    socket?.on('matchingSongs', (data: any[]) => {
      setMatchingSongs(data);
    });
    setShowList(true);

  };

  const clickSong = (song: any) => {
    console.log("clicked on: ", song.name)
    setShowList(false);
    socket?.emit('selectedSong', song);

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

        <p>Request Song:</p>
        <input
          type={'text'}
          onChange={(e) => setRequestedSong(e.target.value)}
          value={requestedSong}
        />
        <button
          className={styles.connectButton}
          onClick={() => getMatchingSongList()}
        >
          <p>Get Matching Songs!</p>
        </button>

        <div>
          {showList && (
            <ul>
              {matchingSongs.map((song, index) => (
                <li key={index}>
                  <button onClick={() => clickSong(song)}>
                    {song.name} by {song.artist}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
