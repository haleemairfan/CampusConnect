
import { io } from "socket.io-client"
import IPaddress from "@/IPaddress";

const socket = io(`http://${IPaddress}:3000`, {
    auth: {
        username: null
    },
    autoConnect: false
});


export default socket;
