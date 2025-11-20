// services/mqttService.js

const mqtt = require('mqtt');
const { getSocketIO } = require('./socketService'); 
const iotController = require('../controllers/iot.controller'); // Import pour le contrôle auto

let client; // Déclaré dans la portée du module

const connectMqtt = () => {
    // 1. Initialisation : Le client MQTT est créé UNE SEULE fois.
    // L'erreur précédente était causée par le fait que les client.on() étaient
    // appelés avant cette ligne (s'ils étaient hors de la fonction) ou par la
    // duplication de l'initialisation dans le client.on('connect').
    client = mqtt.connect(process.env.MQTT_BROKER_URL);

    // 2. Écouteur 'connect'
    client.on('connect', () => {
        console.log('✅ Connecté au broker MQTT.');

        // S'abonne au topic pour recevoir les données des capteurs (T/H/CO2)
        client.subscribe(process.env.MQTT_TOPIC_DATA, (err) => {
            if (err) {
                console.error("Erreur d'abonnement au topic de données:", err);
            }
        });
    });

    // 3. Écouteur 'message' (pour recevoir les données des capteurs)
    client.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            // Exemple : Le topic est parsé pour obtenir l'ID de l'appareil
            const deviceId = topic.split('/')[2]; 

            // 1. Enregistrement en base de données (omis ici, à implémenter)
            // ... Votre logique de sauvegarde des données dans MySQL ...

            // 2. Diffusion en temps réel aux clients React Native via Socket.io
            const io = getSocketIO();
            io.emit('sensor_update', { deviceId, data }); // Ajout de deviceId pour le front

            // 3. DÉCLENCHEMENT DU CONTRÔLE AUTOMATIQUE
            // Appel de la logique métier dans le contrôleur IoT
            iotController.runAutomaticControl(data, deviceId); 

        } catch (e) {
            console.error('Erreur de parsing du message MQTT:', e);
        }
    });

    // 4. Écouteur 'error'
    client.on('error', (err) => {
        console.error('❌ Erreur MQTT:', err);
    });
    
    // NOTE : L'appel client.on('close', ...) est souvent utile aussi.
};


// Fonction pour envoyer une commande au contrôleur (utilisée par mode.controller.js)
const publishCommand = (deviceId, commandPayload) => {
    // Vérification essentielle avant de publier
    if (!client || !client.connected) {
        console.error("Impossible de publier : Client MQTT non connecté.");
        return;
    }
    
    // Topic pour l'envoi de commandes (doit être le topic auquel le contrôleur est abonné)
    const topic = `device/command/${deviceId}/subscribe`; 
    
    client.publish(topic, JSON.stringify(commandPayload), (err) => {
        if (err) {
            console.error(`Erreur de publication de commande pour ${deviceId}:`, err);
        } else {
            console.log(`Commande IR envoyée à ${deviceId} :`, commandPayload);
        }
    });
};

module.exports = { connectMqtt, publishCommand };