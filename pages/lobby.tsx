import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../context/socket';
import { WEBSOCKET_CHANNELS } from '../models/enum/websocket_channels';
import { Room } from '../models/room';
import { User } from '../models/user';
import styles from '../styles/LobbyPage.module.css';
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
      socket.off(WEBSOCKET_CHANNELS.CREATE_GAME);
    };
  }, [socket]);

  const createAccount = () => {
    socket?.emit(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, {
      username: newUserName,
    });

    socket?.on(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, (userData: User) => {
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
    });
  };

  const listenToRoomUpdates = (socket: Socket) => {
    socket.on(WEBSOCKET_CHANNELS.LIST_ROOMS, (data: RoomsList) => {
      setOpenRooms(data.rooms);
    });
  };

  const pushToRoom = (roomId: string) => {
    router.push({ pathname: '/room/', query: { id: roomId } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.homebutton}>
        <a href="http://localhost:3000">Home</a>
      </div>
      <div className={styles.home}>
        <main className={styles.main}>
          <p className={styles.statusInfo}>
            {'Status: ' + socket?.active ? (
              <span className="styles.connectedText">Connected</span>
            ) : (
              <span className="styles.notConnectedText">Not Connected</span>
            )}
          </p>

          <h1 className={styles.title}>Create or join game!</h1>
          <div className={styles.bigContainer}>
            <div className={styles.form}>
              <h2>Enter details</h2>

              <input
                className={styles.smallTexts}
                type={'text'}
                onChange={(e) => setNewUsername(e.target.value)}
                value={newUserName}
                placeholder="Enter username"
              />
              <button
                className={styles.connectButton}
                onClick={() =>
                  userName == '' ? createAccount() : updateUsername()
                }
              >
                <p>{userName == '' ? 'Create account' : 'Update username'}</p>
              </button>
              <p className={styles.detailsInfo}>
                {socket && socket.active && (
                  <p>Current user name: {userName == '' ? '' : userName}</p>
                )}
              </p>
              <input
                type={'text'}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter Room Name"
                value={newRoomName}
              />
              <button
                className={styles.connectButton}
                onClick={() => createRoom()}
              >
                Create Room
              </button>
            </div>
            <div className={styles.form}>
              <h2>Open rooms:</h2>
              {userName == '' ? (
                <p className={styles.detailsInfo}>Create an account first!</p>
              ) : (
                <>
                  {openRooms.map((room, key) => {
                    return (
                      <div key={key}>
                        <p>{room.roomName}</p>
                        {userName && (
                          <button
                            className={styles.formButton}
                            onClick={() => pushToRoom(room.roomId)}
                          >
                            <p>Connect</p>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Lobby;
