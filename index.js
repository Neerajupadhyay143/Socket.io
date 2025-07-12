import { Server } from "socket.io";

const io = new Server(9000, {
    cors: {
        origin: ['https://whats-app-clone-2-smoky.vercel.app/'],     // Allow the Vercel deployed app
        methods: ["GET", "POST"], // Specify allowed methods if needed
        credentials: true // Allow credentials if needed
    }
});

console.log("Socket server running on port 9000");
let users = [];


const addUser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId })
}

const removeUsers = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user?.sub === userId)
}
io.on("connection", (socket) => {
    console.log('user connected !', socket.id)


    socket.on('addUsers', userData => {
        addUser(userData, socket.id)
        io.emit('getusers', users);


    })

    socket.on('logout', userId => {
        users = users.filter(user => user.sub !== userId);
        io.emit('getusers', users);
    });

    socket.on('disconnect', () => {
        removeUsers(socket.id);
        io.emit('getusers', users);
    });

    socket.on('sendMessage', data => {
        const user = getUser(data.reciverID)
        console.log(data.reciverId)
        if (user && user.socketId) {
            console.log(`Sending message from ${data.senderID} to ${data.reciverID} at socket ${user.socketId}`);
            io.to(user.socketId).emit('getMessage', data);
        } else {
            console.log(`User not found or no socket ID: ${data.reciverID}`);
        }
    })

    socket.on('typing', (data) => {
        const receiver = getUser(data.receiverID);
        if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit('typing', { senderId: data.senderId });
        }
    });

    socket.on('stopTyping', (data) => {
        const receiver = getUser(data.receiverID);
        if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit('stopTyping', { senderId: data.senderId });
        }
    });



})

