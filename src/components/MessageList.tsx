import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import { format } from "date-fns";

interface MessageListProps {
  messages: any[];
  currentUser: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  return (
    <Box
      sx={{
        height: "400px",
        overflowY: "auto",
        mb: 2,
        p: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 1,
      }}
    >
      {messages.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center">
          No messages yet. Say hello!
        </Typography>
      ) : (
        messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              mb: 2,
              justifyContent:
                message.userNickname === currentUser
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: "70%",
                backgroundColor:
                  message.userNickname === currentUser ? "#e3f2fd" : "white",
              }}
            >
              {!message.isSystemMessage && (
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {message.userNickname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {message.userNickname}
                  </Typography>
                </Box>
              )}
              <Typography variant="body1" paragraph sx={{ mb: 0 }}>
                {message.body}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(message.timestamp), "hh:mm a")}
              </Typography>
            </Paper>
          </Box>
        ))
      )}
    </Box>
  );
};

export default MessageList;
