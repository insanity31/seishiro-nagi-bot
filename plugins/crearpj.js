handler.help = ['crearpj <nombre> <clase>'];
handler.tags = ['rpg'];
handler.command = /^crearpj$/i;
handler.group = true;
handler.register = true;

export default async function(m, { text, usedPrefix, command }) {
  const user = m.sender;
  const args = text.trim().split(' ');
  
  if (args.length < 2) {
    return m.reply(`❌ *Uso correcto:* ${usedPrefix}${command} <nombre> <clase>\n📚 *Clases disponibles:* guerrero, mago, arquero, sanador`);
  }
  
  const nombre = args[0];
  const clase = args[1].toUpperCase();
  
  if (RPGDatabase.has(user)) {
    return m.reply('❌ Ya tienes un personaje creado! Usa *eliminarpj* primero si quieres crear uno nuevo.');
  }
  
  const CLASES = {
    GUERRERO: { vida: 150, ataque: 20, defensa: 15, mana: 50 },
    MAGO: { vida: 90, ataque: 30, defensa: 8, mana: 150 },
    ARQUERO: { vida: 110, ataque: 25, defensa: 10, mana: 80 },
    SANADOR: { vida: 100, ataque: 15, defensa: 12, mana: 120 }
  };
  
  if (!CLASES[clase]) {
    return m.reply(`❌ Clase no válida. Clases disponibles: guerrero, mago, arquero, sanador`);
  }
  
  const personaje = {
    id: user,
    nombre: nombre,
    clase: clase,
    nivel: 1,
    experiencia: 0,
    oro: 100,
    stats: CLASES[clase],
    vida: CLASES[clase].vida,
    mana: CLASES[clase].mana,
    inventario: [],
    equipo: { arma: null, armadura: null },
    ultimaAccion: Date.now()
  };
  
  RPGDatabase.set(user, personaje);
  
  const mensaje = `🎉 *¡PERSONAJE CREADO!*\n\n` +
                 `👤 *Nombre:* ${nombre}\n` +
                 `⚔️ *Clase:* ${clase.charAt(0) + clase.slice(1).toLowerCase()}\n` +
                 `⭐ *Nivel:* 1\n` +
                 `💰 *Oro:* 100\n` +
                 `❤️ *Vida:* ${CLASES[clase].vida}\n` +
                 `🔮 *Maná:* ${CLASES[clase].mana}\n` +
                 `⚔️ *Ataque:* ${CLASES[clase].ataque}\n` +
                 `🛡️ *Defensa:* ${CLASES[clase].defensa}\n\n` +
                 `¡Usa *${usedPrefix}perfil* para ver tu estado!`;
  
  m.reply(mensaje);
}