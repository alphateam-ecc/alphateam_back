// controllers/mode.controller.js
const db = require('../config/db.config');
const Mode = db.Mode;
const { publishCommand } = require('../services/mqttService');
const { protect } = require('../middleware/auth.middleware'); // Pour protéger les routes

// --- 1. CRÉER UN NOUVEAU MODE PRÉFÉRÉ ---
exports.createMode = async (req, res) => {
    // req.user est disponible grâce au middleware 'protect'
    const userId = req.user.user_id; 
    const { profile_name, setpoint_temp, setpoint_hum, irCommandCode } = req.body;

    if (!profile_name || !setpoint_temp || !irCommandCode) {
        return res.status(400).json({ message: 'Nom, température cible et codes IR sont requis.' });
    }

    try {
        const newMode = await Mode.create({
            user_id: userId,
            profile_name,
            setpoint_temp,
            setpoint_hum,
            irCommandCode
        });
        res.status(201).json(newMode);
    } catch (error) {
        console.error('作成中のエラー:', error);
        res.status(500).json({ message: '作成中のエラーが発生しました。' });
    }
};

// --- 2. APPLIQUER (ENVOYER) UN MODE OU UNE COMMANDE MANUELLE ---
exports.applyModeOrCommand = async (req, res) => {
    const userId = req.user.user_id;
    const { modeId, manualCommand } = req.body; // Soit modeId, soit manualCommand (ex: "TEMP_PLUS")

    let commandPayload;
    // NOTE: deviceName n'existe pas dans le modèle User actuellement
    // Vous devrez soit l'ajouter au modèle, soit utiliser un autre mécanisme
    let deviceId = req.user.deviceName; // Récupère le nom du contrôleur associé à l'utilisateur

    if (!deviceId) {
        // message: 'Aucun contrôleur n\'est associé à cet utilisateur.'
        return res.status(400).json({ message: 'コントローラーがユーザーに関連付けられていません。' });
    }

    try {
        if (modeId) {
            // Logique pour un MODE PRÉFÉRÉ
            const mode = await Mode.findOne({ where: { profile_id: modeId, user_id: userId } });
            if (!mode) {
                return res.status(404).json({ message: 'モードが見つからないか、許可されていません。' });
            }
            // Le payload contient les codes IR et la cible pour l'automatisation locale
            commandPayload = { type: 'MODE', data: mode.irCommandCode, target: { temp: mode.setpoint_temp, humidity: mode.setpoint_hum } };
            
        } else if (manualCommand) {
            // Logique pour une COMMANDE MANUELLE (ex: Temp+)
            // Dans un cas réel, vous auriez une table de lookup pour obtenir le code IR de 'TEMP_PLUS'
            const irCodeManual = getIrCodeForManualCommand(manualCommand); // Fonction utilitaire hypothétique
            
            commandPayload = { type: 'MANUAL', data: irCodeManual };
        } else {
            return res.status(400).json({ message: 'modeIdまたはmanualCommandを指定してください。' });
        }
        
        // --- PUBLICATION MQTT ---
        // Envoie la commande au contrôleur intelligent via MQTT
        publishCommand(deviceId, commandPayload);

        res.json({ message: `コントローラー ${deviceId} にコマンドを送信しました。`, payload: commandPayload });

    } catch (error) {
        console.error('送信中のエラー:', error);
        res.status(500).json({ message: 'コマンド送信中にサーバーエラーが発生しました。' });
    }
};

// --- ROUTES ASSOCIÉES (À DÉFINIR dans mode.routes.js) ---
/* router.post('/', protect, modeController.createMode);
router.post('/apply', protect, modeController.applyModeOrCommand);
*/

// Fonction utilitaire (simulée)
function getIrCodeForManualCommand(command) {
    const codes = {
        'TEMP_PLUS': { code: 'IR_CODE_PLUS_1', deviceType: 'AC' },
        'TEMP_MOINS': { code: 'IR_CODE_MOINS_1', deviceType: 'AC' },
        // ...
    };
    return codes[command] || null;
}