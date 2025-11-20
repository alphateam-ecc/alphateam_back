// // src/controllers/control.controller.js
// const { startControlLoop, stopControlLoop } = require('../services/control.service');

// exports.startControl = (req, res) => {
//   startControlLoop();
//   res.json({ message: 'Control loop started (every 10s)' });
// };

// exports.stopControl = (req, res) => {
//   stopControlLoop();
//   res.json({ message: 'Control loop stopped' });
// };

// exports.getStatus = (req, res) => {
//   res.json({ status: 'API is running', time: new Date().toISOString() });
// };

// src/controllers/control.controller.js

const controlService = require('../services/control.service');

exports.setNewSetpoint = async (req, res) => {
    try {
        // Récupération des valeurs envoyées par le bouton de l'APK
        const { targetTemperature, targetHumidity } = req.body; 

        if (typeof targetTemperature !== 'number' || typeof targetHumidity !== 'number') {
             return res.status(400).send({ message: "Les valeurs doivent être des nombres valides." });
        }

        // Appel du Service pour gérer la communication (maintenant par WebSocket)
        await controlService.updateDeviceSetpoint(targetTemperature, targetHumidity);

        // Réponse HTTP immédiate à l'APK, car l'envoi WS est asynchrone
        res.status(200).send({ success: true, message: "Consignes envoyées via WebSocket." });
    } catch (error) {
        console.error("Erreur lors du traitement de la consigne:", error);
        res.status(500).send({ success: false, message: "Échec du contrôle." });
    }
};