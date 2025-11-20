// // services/socketService.js
// const socketIO = require('socket.io');

// let io; // Variable pour stocker l'instance Socket.IO

// // Fonction pour initialiser Socket.IO sur le serveur HTTP
// const initSocket = (server) => {
//     // Crée une instance de Socket.IO
//     io = socketIO(server, {
//         // Configuration CORS essentielle pour React Native
//         cors: {
//             origin: "*", // A changer pour votre URL d'application en production
//             methods: ["GET", "POST"]
//         }
//     });

//     io.on('connection', (socket) => {
//         console.log(`📡 Nouveau client WebSocket connecté: ${socket.id}`);
        
//         socket.on('disconnect', () => {
//             console.log(`Client WebSocket déconnecté: ${socket.id}`);
//         });

//         // Vous pouvez ajouter ici d'autres écouteurs pour la communication mobile -> backend
//         // Ex: socket.on('manual_command', (data) => { /* ... */ });
//     });
// };

// // Fonction pour obtenir l'instance io dans d'autres fichiers (ex: mqttService.js)
// const getSocketIO = () => {
//     if (!io) {
//         throw new Error('Socket.IO non initialisé. Appelez initSocket en premier.');
//     }
//     return io;
// };

// // Exportez les deux fonctions
// module.exports = {
//     initSocket,
//     getSocketIO
// };