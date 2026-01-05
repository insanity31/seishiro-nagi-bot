let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    user.cyberHunter = {
      rank: "Novato",
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      cyberware: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0,
      dailyStreak: 0,
      lastDaily: 0
    }
  }
  
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  
  // Verificar última reclamación
  if (!user.cyberHunter.lastDaily) user.cyberHunter.lastDaily = 0
  
  const timeSinceLast = now - user.cyberHunter.lastDaily
  
  if (timeSinceLast < oneDay && user.cyberHunter.lastDaily !== 0) {
    const hoursLeft = 24 - Math.floor(timeSinceLast / (60 * 60 * 1000))
    const minutesLeft = 60 - Math.floor((timeSinceLast % (60 * 60 * 1000)) / 60000)
    
    return m.reply(
      `⏳ Ya reclamaste tu recompensa diaria hoy.\n` +
      `🕐 Vuelve en: ${hoursLeft}h ${minutesLeft}m`
    )
  }
  
  // Calcular racha
  if (timeSinceLast > oneDay * 2) {
    // Perdió la racha
    user.cyberHunter.dailyStreak = 1
  } else {
    // Mantiene la racha
    user.cyberHunter.dailyStreak = (user.cyberHunter.dailyStreak || 0) + 1
  }
  
  user.cyberHunter.lastDaily = now
  
  // Calcular recompensa
  const baseReward = 100
  const streakBonus = user.cyberHunter.dailyStreak * 20
  const levelBonus = user.cyberHunter.level * 10
  
  let totalReward = baseReward + streakBonus + levelBonus
  
  // Recompensas especiales por rachas
  let specialRewards = []
  
  if (user.cyberHunter.dailyStreak === 7) {
    totalReward *= 2
    specialRewards.push("🎯 **BONUS x2 por racha de 7 días**")
  }
  
  if (user.cyberHunter.dailyStreak === 30) {
    totalReward *= 3
    user.cyberHunter.reputation += 50
    specialRewards.push("🏆 **BONUS x3 +50 reputación por racha de 30 días**")
  }
  
  // Recompensa aleatoria adicional
  const randomChance = Math.random()
  if (randomChance < 0.1) {
    const extraReward = Math.floor(Math.random() * 200) + 100
    totalReward += extraReward
    specialRewards.push(`✨ **BONUS SORPRESA: +${extraReward} créditos**`)
  }
  
  // Aplicar recompensa
  user.credit = (user.credit || 0) + totalReward
  
  let dailyMessage = []
  dailyMessage.push(`🎁 *RECOMPENSA DIARIA* 🎁`)
  dailyMessage.push(`📅 Fecha: ${new Date().toLocaleDateString()}`)
  dailyMessage.push(`🔥 Racha actual: ${user.cyberHunter.dailyStreak} días`)
  dailyMessage.push(``)
  dailyMessage.push(`💰 *DESGLOSE:*`)
  dailyMessage.push(`• Base: ${baseReward} créditos`)
  dailyMessage.push(`• Bonus racha: +${streakBonus} créditos`)
  dailyMessage.push(`• Bonus nivel ${user.cyberHunter.level}: +${levelBonus} créditos`)
  
  if (specialRewards.length > 0) {
    dailyMessage.push(``)
    dailyMessage.push(`🎯 *RECOMPENSAS ESPECIALES:*`)
    specialRewards.forEach(reward => dailyMessage.push(reward))
  }
  
  dailyMessage.push(``)
  dailyMessage.push(`💰 *TOTAL: ${totalReward} créditos*`)
  dailyMessage.push(`💳 Saldo actual: ${user.credit} ⚡`)
  dailyMessage.push(``)
  dailyMessage.push(`⏰ Próxima recompensa en 24 horas`)
  dailyMessage.push(`💡 Mantén tu racha para mejores recompensas`)
  
  await m.reply(dailyMessage.join('\n'))
}

handler.help = ['diario', 'daily', 'recompensa', 'claim']
handler.tags = ['rpg']
handler.command = /^(diario|daily|recompensa|claim|reclamar)$/i
handler.group = true
handler.register = true

export default handler