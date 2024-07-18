import { Server } from "socket.io";

const io = new Server(9000, {
    cors: {
        origin: 'https://localhost:3000'
    }
})

let users = [];


const adduser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId })
}

const removeUsers = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user.sub === userId)
}
io.on("connection", (socket) => {
    console.log('user connected !')

    socket.on('addusers', userData => {
        adduser(userData, socket.id)

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
        const user = getUser(data.reciverId)
        io.to(user.socketId).emit('getMessage', data)
    })
})          