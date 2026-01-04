const fs = require('fs');
const path = require('path');

module.exports = {
  name: "profile",
  alias: ["perfil", "me"],
  description: "Muestra tu perfil RPG",
  category: "RPG",
  
  async execute(ctx, { m, args, command, prefix, userJid, bot, pushName, Database }) {
    const db = Database.read();
    const userId = m.sender;
    
    // Obtener o crear usuario
    if (!db.users[userId]) {
      db.users[userId] = {
        username: pushName || "Jugador",
        level: 1,
        xp: 0,
        coins: 1000,
        gems: 10,
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        class: "Novato",
        inventory: [],
        missions: { daily: 0 },
        cooldowns: {},
        stats: {
          battlesWon: 0,
          monstersKilled: 0,
          coinsEarned: 1000
        },
        createdAt: new Date().toISOString()
      };
      Database.write(db);
    }
    
    const user = db.users[userId];
    const xpNeeded = user.level * 100;
    const xpPercent = Math.round((user.xp / xpNeeded) * 100);
    
    const progressBar = (percent) => {
      const filled = '█'.repeat(Math.floor(percent / 5));
      const empty = '░'.repeat(20 - Math.floor(percent / 5));
      return `[${filled}${empty}]`;
    };
    
    const rank = getRank(user.level);
    
    const profileMsg = `👤 *PERFIL DE ${user.username.toUpperCase()}*

🏅 *Información Básica*
• Nivel: ${user.level} ${rank}
• XP: ${user.xp}/${xpNeeded}
${progressBar(xpPercent)} ${xpPercent}%

❤️ *Estadísticas*
• Salud: ${user.health}/${user.maxHealth}
• Ataque: ${user.attack} ⚔️
• Defensa: ${user.defense} 🛡️
• Clase: ${user.class}

💰 *Economía*
• Monedas: ${user.coins.toLocaleString()} 🪙
• Gemas: ${user.gems} 💎
• Items: ${user.inventory.length}

🎖️ *Logros*
• Batallas: ${user.stats.battlesWon} victorias
• Monstruos: ${user.stats.monstersKilled} eliminados
• Recaudado: ${user.stats.coinsEarned.toLocaleString()} monedas
• Días activo: ${user.missions.daily}

📅 *Desde:* ${new Date(user.createdAt).toLocaleDateString()}`;

    await bot.sendMessage(m.chat, { text: profileMsg }, { quoted: m });
  }
};

function getRank(level) {
  if (level >= 50) return '🏆 Leyenda';
  if (level >= 30) return '👑 Maestro';
  if (level >= 20) return '⚔️ Héroe';
  if (level >= 10) return '🛡️ Guerrero';
  if (level >= 5) return '🎒 Aventurero';
  return '👶 Novato';
      }
