// src/services/control.service.js

// Récupérer l'instance de Socket.IO depuis index.js
const { io } = require('../../index'); 

/**
 * Envoie les nouvelles consignes de température et d'humidité à l'appareil IoT
 * via le canal WebSocket 'set_air_conditioner_setpoint'.
 * @param {number} temp - La température cible.
 * @param {number} hum - L'humidité cible.
 */
exports.updateDeviceSetpoint = async (temp, hum) => {
    // 1. Définition du "payload" (le message à envoyer)
    const payload = {
        targetTemperature: temp,
        targetHumidity: hum,
        timestamp: new Date().toISOString()
    };
    
    // 2. Vérification s'il y a des clients (appareils) connectés
    if (io.engine.clientsCount === 0) {
        console.warn("Aucun client WebSocket (appareil IoT) connecté pour recevoir la commande.");
        // Gérer l'erreur ou l'état de non-connexion si nécessaire
        // throw new Error("Appareil IoT hors ligne."); 
    }
    
    // 3. ENVOI DE LA COMMANDE PAR WEBSOCKET
    // io.emit() envoie le message à *tous* les clients connectés.
    // Vous pouvez utiliser io.to(socketId).emit() si vous voulez cibler un appareil spécifique.
    const socketEvent = 'set_air_conditioner_setpoint';
    
    io.emit(socketEvent, payload);
    
    console.log(`Commande WebSocket envoyée : T=${temp}, H=${hum} sur l'événement : ${socketEvent}`);
    
    // Dans un vrai cas, vous n'attendriez pas de réponse immédiate,
    // mais plutôt un message de confirmation de l'appareil via un autre socket.
    return true; 
};