import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

export const socket: Socket | undefined = io(
  `${process.env.NEXT_PUBLIC_SOCKET_URL}`,
);
export const SocketContext = createContext<Socket | undefined>(undefined);
