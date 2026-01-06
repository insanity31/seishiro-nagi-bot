import fetch from 'node-fetch';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const API_KEY = 'stellar-3Tjfq4Rj';
const API_URL = 'https://api.stellarwa.xyz/dl/facebook';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply("❌ Por favor, ingresa un enlace de Facebook.\n> *Ejemplo:* .fb https://facebook.com/...");
    }

    // Validar que sea un enlace de Facebook
    if (!text.match(/facebook\.com|fb\.watch|fb\.com/)) {
        return m.reply("❌ El enlace proporcionado no parece ser de Facebook.\n> *Ejemplo válido:* https://www.facebook.com/...");
    }

    // Enviar reacción de reloj (⌚)
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch (error) {
        console.error('Error enviando reacción:', error);
    }

    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat, 
        { text: '📥 *Descargando contenido de Facebook...*\n> Por favor, espera un momento.' }, 
        { quoted: m }
    );

    try {
        const url = `${API_URL}?url=${encodeURIComponent(text)}&apikey=${API_KEY}`;
        console.log('URL de la API:', url);
        
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Verificar si la API devolvió un error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'Error desconocido de la API');
        }
        
        console.log('Respuesta de la API:', JSON.stringify(data, null, 2));
        
        // Extraer información del video
        const videoInfo = data.result || data;
        
        if (!videoInfo.url || !videoInfo.url.hd || !videoInfo.url.sd) {
            throw new Error('No se encontraron enlaces de descarga válidos');
        }
        
        const title = videoInfo.title || 'Video de Facebook';
        const thumbnail = videoInfo.thumbnail || videoInfo.thumb || null;
        const duration = videoInfo.duration || 'Desconocida';
        const quality = videoInfo.quality || 'HD';
        const size = videoInfo.size || 'Desconocido';
        
        // Enviar información del video con botones
        const caption = `📱 *DESCARGA DE FACEBOOK*\n\n` +
                       `📌 *Título:* ${title}\n` +
                       `⏱️ *Duración:* ${duration}\n` +
                       `📊 *Calidad:* ${quality}\n` +
                       `💾 *Tamaño:* ${size}\n\n` +
                       `*Selecciona la calidad:*`;
        
        const buttons = [
            { buttonId: 'hd', buttonText: { displayText: '🎬 HD' }, type: 1 },
            { buttonId: 'sd', buttonText: { displayText: '📱 SD' }, type: 1 },
            { buttonId: 'audio', buttonText: { displayText: '🎵 Audio' }, type: 1 }
        ];
        
        const buttonMessage = {
            text: caption,
            footer: '🌸𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧🌸',
            headerType: 1,
            buttons: buttons
        };
        
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
        
        // Reacción de éxito
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch (error) {
            console.error('Error enviando reacción de éxito:', error);
        }
        
        // Eliminar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                delete: processingMsg.key 
            }
        );
        
        // Manejar interacción de botones
        const filter = (msg) => msg.key && msg.key.remoteJid === m.chat;
        const collector = conn.ev.createBufferedFunction(
            async (events) => {
                for (const event of events) {
                    if (event.type === 'messages.upsert' && event.messages[0]) {
                        const msg = event.messages[0];
                        if (msg.message?.buttonsResponseMessage?.selectedButtonId && 
                            msg.message.buttonsResponseMessage.contextInfo?.stanzaId === m.key.id) {
                            
                            const selectedQuality = msg.message.buttonsResponseMessage.selectedButtonId;
                            const downloadUrl = videoInfo.url[selectedQuality] || videoInfo.url.hd;
                            
                            if (downloadUrl) {
                                await conn.sendMessage(m.chat, {
                                    text: `⬇️ *Descargando en calidad ${selectedQuality.toUpperCase()}...*\n> Por favor, espera...`
                                }, { quoted: msg });
                                
                                // Enviar el video según la calidad seleccionada
                                if (selectedQuality === 'audio') {
                                    await conn.sendMessage(m.chat, {
                                        audio: { url: downloadUrl },
                                        mimetype: 'audio/mpeg',
                                        fileName: `${title}.mp3`
                                    }, { quoted: msg });
                                } else {
                                    await conn.sendMessage(m.chat, {
                                        video: { url: downloadUrl },
                                        caption: `📱 *Facebook Downloader*\n📌 ${title}\n🎬 Calidad: ${selectedQuality.toUpperCase()}`
                                    }, { quoted: msg });
                                }
                            }
                            break;
                        }
                    }
                }
            }
        );

    } catch (error) {
        console.error('Error en Facebook Downloader:', error);
        
        // Mensaje de error
        await conn.sendMessage(
            m.chat,
            { 
                text: `❌ *Error al descargar*\n\n` +
                      `> *Motivo:* ${error.message}\n` +
                      `> *Posibles causas:*\n` +
                      `• El enlace es privado/restringido\n` +
                      `• El video fue eliminado\n` +
                      `• Problema temporal con Facebook\n\n` +
                      `*Intenta con otro enlace.*`
            }
        );
        
        // Reacción de error
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch (reactionError) {
            console.error('Error enviando reacción de error:', reactionError);
        }
        
        // Eliminar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error en la descarga",
                edit: processingMsg.key 
            }
        );
    }
}

handler.help = ["fb <enlace>", "facebook <enlace>"];
handler.tags = ["descargas"];
handler.command = ["fb", "facebook", "face", "fbdl"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;