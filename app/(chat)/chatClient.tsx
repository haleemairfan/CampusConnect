
import { io } from "socket.io-client"

const socket = io("http://172.31.17.153:3000", {
    auth: {
        username: null
    },
    autoConnect: false
});


export default socket;
