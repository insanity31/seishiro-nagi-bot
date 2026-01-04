// By DuarteXV 
import { performance } from 'perf_hooks'

var handler = async (m, { conn, text }) => {
    let who;
    let userName;

    if (m.isGroup) {
        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
            userName = await conn.getName(who);
        } else if (m.quoted) {
            who = m.quoted.sender;
            userName = await conn.getName(who);
        } else {
            who = m.chat;
        }
    } else {
        who = m.chat;
    }

    if (!who) return conn.reply(m.chat, `Menciona a alguien o responde a un mensaje.`, m);

    if (!userName) {
        userName = text || 'Usuario';
    }

    let start = `🔍 Iniciando escaneo...`;
    let progress = `📡 ${pickRandom(['12%','18%','23%','29%','34%'])} - Buscando huellas`;
    let progress2 = `📡 ${pickRandom(['41%','47%','52%','58%','63%'])} - Rastreando conexiones`;
    let progress3 = `📡 ${pickRandom(['69%','74%','78%','83%','87%'])} - Analizando metadatos`;
    let progress4 = `📡 ${pickRandom(['91%','94%','96%','98%','99%'])} - Compilando datos`;
    let progress5 = `✅ 100% - Escaneo completado`;

    const { key } = await conn.sendMessage(m.chat, { text: `${start}` }, { quoted: m });
    await delay(1000);
    await conn.sendMessage(m.chat, { text: `${progress}`, edit: key });
    await delay(1000);
    await conn.sendMessage(m.chat, { text: `${progress2}`, edit: key });
    await delay(1000);
    await conn.sendMessage(m.chat, { text: `${progress3}`, edit: key });
    await delay(1000);
    await conn.sendMessage(m.chat, { text: `${progress4}`, edit: key });
    await delay(1000);
    await conn.sendMessage(m.chat, { text: `${progress5}`, edit: key });
    await delay(500);

    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const isps = ['Claro', 'Movistar', 'Entel', 'Bitel', 'VTR', 'Tigo', 'Digitel', 'WOM', 'Personal'];
    const isp = pickRandom(isps);
    const ciudades = ['Lima', 'Bogotá', 'Buenos Aires', 'Santiago', 'Ciudad de México', 'Madrid', 'São Paulo'];
    const ciudad = pickRandom(ciudades);
    const proveedores = ['Google', 'Cloudflare', 'OpenDNS'];
    const dns = pickRandom(proveedores);
    const conexiones = ['Fibra óptica', 'ADSL', '4G/LTE', 'WiFi', 'Cable'];
    const conexion = pickRandom(conexiones);
    const dispositivos = ['Android', 'iPhone', 'Windows 10/11', 'MacOS', 'Linux'];
    const dispositivo = pickRandom(dispositivos);

    let doxeo = `📊 *INFORME DE ESCANEO*
━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleDateString('es-ES')}
⏰ ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
━━━━━━━━━━━━━━━━━━

👤 *Usuario:* ${userName}
🌐 *IP:* ${ip}
📍 *Ubicación:* ${ciudad}
📶 *ISP:* ${isp}
🔌 *Conexión:* ${conexion}
🖥️ *Dispositivo:* ${dispositivo}

🔧 *Configuración Red:*
• DNS: ${dns}
• Gateway: 192.168.${Math.floor(Math.random() * 10)}.1
• Subnet: 255.255.255.0
• Puertos: ${pickRandom(['443', '80', '22'])}
• Latencia: ${Math.floor(Math.random() * 80) + 20}ms
• Velocidad: ${Math.floor(Math.random() * 90) + 10} Mbps

📱 *Datos adicionales:*
• Proxy: ${pickRandom(['No detectado', 'Configuración básica'])}
• VPN: ${pickRandom(['Inactiva', 'No detectada'])}
• Firewall: ${pickRandom(['Activo', 'Moderado'])}
• Sistema: ${pickRandom(['Actualizado', 'Parcialmente actualizado'])}
• Navegador: ${pickRandom(['Chrome', 'Firefox', 'Edge', 'Safari'])}
• Hora local: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}

━━━━━━━━━━━━━━━━━━`;

    m.reply(doxeo);
}

handler.help = ['doxear'];
handler.tags = ['fun'];
handler.command = ['doxear', 'doxxeo', 'doxeo'];
handler.register = true;
handler.group = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));