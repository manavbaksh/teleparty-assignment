import React, { useState } from "react";
import { Button, Box, Typography, Paper, Avatar } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { TelepartyClient, SocketMessageTypes } from "teleparty-websocket-lib";

interface ChatRoomProps {
  user: {
    nickname: string;
    roomId: string;
    userIcon?: string;
  };
  client: TelepartyClient | null;
  messages: any[];
  onLogout: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  user,
  client,
  messages,
  onLogout,
}) => {
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !client) return;
    client.sendMessage(SocketMessageTypes.SEND_MESSAGE, {
      body: message,
    });
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          {user.userIcon && (
            <Avatar src={user.userIcon} sx={{ width: 40, height: 40, mr: 2 }} />
          )}
          <Typography variant="h5">Room: {user.roomId}</Typography>
        </Box>
        <Button variant="outlined" onClick={onLogout}>
          Leave Room
        </Button>
      </Box>

      <MessageList messages={messages} currentUser={user.nickname} />

      <MessageInput
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        client={client}
      />
    </Paper>
  );
};

export default ChatRoom;
