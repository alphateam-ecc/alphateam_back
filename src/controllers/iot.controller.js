// controllers/iot.controller.js
const db = require('../config/db.config');
const Mode = db.Mode;
const User = db.User;
const { publishCommand } = require('../services/mqttService');

// --- 1. (Fonction REST simple) Obtenir le statut de l'appareil associé ---
// Utile pour React Native pour vérifier si le contrôleur est en ligne (si la donnée est stockée en DB)
exports.getDeviceStatus = async (req, res) => {
    try {
        const deviceName = req.user.deviceName;
        // NOTE: Dans un vrai système, vous vérifieriez le dernier timestamp de la donnée reçue (via DB)
        // ou vous interrogeriez l'état en direct via MQTT/WebSocket.
        res.json({ deviceName, status: 'Online' }); 

    } catch (error) {
        res.status(500).json({ message: 'Erreur de récupération du statut de l\'appareil.' });
    }
};

// --- 2. FONCTION DE CONTRÔLE AUTOMATIQUE ---
// Cette fonction serait appelée par `mqttService.js` chaque fois qu'une nouvelle donnée de capteur est reçue.
exports.runAutomaticControl = async (sensorData, deviceId) => {
    const { temperature, humidity, CO2 } = sensorData;

    try {
        // Logique de recherche (Trouver l'utilisateur/le mode actif pour ce deviceId)
        const user = await User.findOne({ where: { deviceName: deviceId } });
        
        if (!user) {
            console.log(`[AUTO] Pas d'utilisateur trouvé pour l'appareil: ${deviceId}`);
            return;
        }

        // --- Logique d'Automatisation (Simplifiée) ---
        // Dans un vrai système, l'utilisateur définirait quel mode est "actif"
        const activeMode = await Mode.findOne({ where: { user_id: user.user_id } }); // Cherche le premier mode pour l'exemple

        if (activeMode) {
            const targetTemp = activeMode.setpoint_temp;
            const tempDifference = targetTemp - temperature;
            const IR_CODE_COOL = { code: 'IR_CODE_REFROIDIR', deviceType: 'AC' };
            const IR_CODE_HEAT = { code: 'IR_CODE_CHAUFFER', deviceType: 'AC' };

            // Si la température est trop basse (tolérance de 1°C)
            if (tempDifference > 1) { 
                console.log(`[AUTO] Température trop basse. Envoi de l'ordre de CHAUFFER.`);
                // Envoyer la commande IR via MQTT
                publishCommand(deviceId, { type: 'AUTO', command: IR_CODE_HEAT });
                
            // Si la température est trop haute (tolérance de 1°C)
            } else if (tempDifference < -1) { 
                console.log(`[AUTO] Température trop haute. Envoi de l'ordre de REFROIDIR.`);
                // Envoyer la commande IR via MQTT
                publishCommand(deviceId, { type: 'AUTO', command: IR_CODE_COOL });
            } else {
                // console.log(`[AUTO] Température stable pour ${deviceId}.`);
            }
            
            // NOTE : La logique pour l'humidité et le CO2 serait ajoutée ici.

        } else {
            // console.log(`[AUTO] Aucun mode actif pour ${deviceId}. Pas de contrôle automatique.`);
        }

    } catch (error) {
        console.error(`Erreur dans la logique d'automatisation pour ${deviceId}:`, error);
    }
};