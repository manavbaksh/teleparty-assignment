import React, { useState, useRef } from "react";
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes,
  SessionChatMessage,
} from "teleparty-websocket-lib";
import LoginForm from "./components/LoginForm";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

interface User {
  nickname: string;
  roomId: string;
  userIcon?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionReady = useRef(false);

  const handleLogin = async (
    nickname: string,
    roomId: string,
    isCreating: boolean,
    userIcon?: string
  ) => {
    try {
      setConnectionError(null);
      connectionReady.current = false;

      const eventHandler: SocketEventHandler = {
        onConnectionReady: () => {
          console.log("Connection ready");
          connectionReady.current = true;
          performRoomOperations();
        },
        onClose: () => {
          setConnectionError("Connection lost. Please refresh the page.");
        },
        onMessage: (message) => {
          if (message.type === SocketMessageTypes.SEND_MESSAGE) {
            setMessages((prev) => [
              ...prev,
              message.data as SessionChatMessage,
            ]);
          }
        },
      };

      const newClient = new TelepartyClient(eventHandler);
      setClient(newClient);

      const performRoomOperations = async () => {
        try {
          let roomIdResult: string;
          if (isCreating) {
            roomIdResult = await newClient.createChatRoom(nickname, userIcon);
          } else {
            await newClient.joinChatRoom(nickname, roomId, userIcon);
            roomIdResult = roomId;
          }
          setUser({ nickname, roomId: roomIdResult, userIcon });
        } catch (error) {
          console.error("Room operation error:", error);
          setConnectionError("Failed to create/join room. Please try again.");
        }
      };

      if (connectionReady.current) {
        await performRoomOperations();
      }
    } catch (error) {
      console.error("Connection initialization error:", error);
      setConnectionError("Failed to initialize connection. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setClient(null);
    setMessages([]);
    setConnectionError(null);
    connectionReady.current = false;
  };

  return (
    <div className="app">
      <h1>Teleparty Chat</h1>
      {connectionError && <div className="error">{connectionError}</div>}
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatRoom
          user={user}
          client={client}
          messages={messages}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
