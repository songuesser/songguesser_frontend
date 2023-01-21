const enum WEBSOCKET_CHANNELS {
  CREATE_ACCOUNT = 'createAccount',
  SET_USERNAME = 'setUsername',
  CREATE_ROOM = 'createRoom',
  LIST_ROOMS = 'listRooms',
  SET_ROOM_NAME = 'setRoomName',
  JOIN_ROOM = 'joinRoom',
  CREATE_GAME = 'createGame',
  IN_GAME = 'inGame',
  IN_GAME_CHAT = 'inGameChat',
  IN_GAME_JOIN_PLAYER = 'inGameJoinPlayer',
}

export { WEBSOCKET_CHANNELS };
