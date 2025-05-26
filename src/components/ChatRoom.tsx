import React from "react";
import { Box, Typography, Paper, Avatar, IconButton } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { TelepartyClient, SocketMessageTypes } from "teleparty-websocket-lib";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

interface ChatRoomProps {
  user: {
    nickname: string;
    roomId: string;
    userIcon?: string;
  };
  client: TelepartyClient | null;
  messages: any[];
  onLogout: () => void;
  usersTyping: string[];
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  user,
  client,
  messages,
  onLogout,
  usersTyping,
}) => {
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
        <IconButton onClick={onLogout} color="error" title="Leave Room">
          <ExitToAppIcon />
        </IconButton>
      </Box>

      <MessageList messages={messages} currentUser={user.nickname} />
      {usersTyping.length > 0 && (
        <div className="typing-indicator">
          {usersTyping.join(", ")} {usersTyping.length > 1 ? "are" : "is"}{" "}
          typing...
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        client={client}
        currentUser={user.nickname} // Pass this if needed
      />
    </Paper>
  );
};

export default ChatRoom;
