async function handler(m, { conn, usedPrefix, command }) {
    try {
        const communityLink = 'https://chat.whatsapp.com/LRQrf8vv50BDtwN8JWfhrX';
        const channelLink = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i';
        
        const message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                       `🔗 *ENLACES DE LA COMUNIDAD*\n\n` +
                       `📱 *Grupo de WhatsApp:*\n` +
                       `\`\`\`${communityLink}\`\`\`\n\n` +
                       `📢 *Canal Oficial:*\n` +
                       `\`\`\`${channelLink}\`\`\`\n\n` +
                       `_Para unirte, copia el enlace y pégalo en WhatsApp_\n` +
                       `*¡Te esperamos!* 🎉`;
        
        // Intentar diferentes métodos de envío
        await conn.sendMessage(m.chat, { 
            text: message, 
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: false 
            }
        }, { quoted: m });
        
        console.log(`Comando ${command} ejecutado por ${m.sender} en ${m.chat}`);
        
    } catch (error) {
        console.error('Error en comando links:', error);
        await m.reply('❌ Error al enviar los enlaces. Intenta nuevamente.');
    }
}

handler.help = ["links"];
handler.tags = ["info"];
handler.command = /^(links|grupo|canal|comunidad)$/i;
handler.limit = false;
handler.register = true;
handler.group = true;

export default handler;