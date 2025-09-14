export interface ClipboardItem {
  contain: string;
  hash: string;
}

export interface Message {
  type: string;
  content: string;
  room: string;
}

export interface HomePageProps {
  onRoomJoin: (roomCode: string) => void;
}

export interface ClipboardRoomProps {
  roomCode: string;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  onLeaveRoom: () => void;
}
