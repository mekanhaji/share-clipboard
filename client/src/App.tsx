import { useState } from "react";
import { HomePage, ClipboardRoom } from "./components";

const App = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!currentRoom) {
    return <HomePage onRoomJoin={setCurrentRoom} />;
  }

  return (
    <ClipboardRoom
      roomCode={currentRoom}
      isConnected={isConnected}
      setIsConnected={setIsConnected}
      onLeaveRoom={() => setCurrentRoom(null)}
    />
  );
};

export default App;
