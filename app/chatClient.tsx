import { io } from "socket.io-client";

const socket = io("http://192.168.50.176:3000", {
    auth: {
        username: null
    },
    autoConnect: false
});

export default socket;
