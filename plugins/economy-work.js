let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) initEconomy(user)
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  const now = Date.now()
  
  // Trabajos disponibles con diferentes cooldowns y pagos
  const jobs = {
    'repartidor': {
      name: '🚚 Repartidor',
      cooldown: 2 * 60 * 60 * 1000, // 2 horas
      basePay: 150,
      level: 1,
      description: 'Reparte paquetes por la ciudad'
    },
    'constructor': {
      name: '👷 Constructor',
      cooldown: 4 * 60 * 60 * 1000, // 4 horas
      basePay: 300,
      level: 3,
      description: 'Construye edificios'
    },
    'programador': {
      name: '💻 Programador',
      cooldown: 6 * 60 * 60 * 1000, // 6 horas
      basePay: 500,
      level: 5,
      description: 'Desarrolla software'
    },
    'doctor': {
      name: '👨‍⚕️ Doctor',
      cooldown: 8 * 60 * 60 * 1000, // 8 horas
      basePay: 800,
      level: 8,
      description: 'Atiende pacientes'
    },
    'ceo': {
      name: '👔 CEO',
      cooldown: 12 * 60 * 60 * 1000, // 12 horas
      basePay: 1500,
      level: 12,
      description: 'Dirige una empresa'
    }
  }
  
  // Si no tiene trabajo, mostrar lista
  if (!user.economy.job || !args[0]) {
    if (user.economy.job && !args[0]) {
      // Verificar si puede trabajar
      if (!user.economy.lastWork) user.economy.lastWork = 0
      const timeLeft = user.economy.lastWork + jobs[user.economy.job].cooldown - now
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (60 * 60 * 1000))
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / 60000)
        
        return m.reply(
          `⏳ *NO PUEDES TRABAJAR AÚN*\n\n` +
          `💼 Trabajo: ${jobs[user.economy.job].name}\n` +
          `⏰ Tiempo restante: ${hours}h ${minutes}m\n\n` +
          `📝 Descripción: ${jobs[user.economy.job].description}\n` +
          `💰 Pago: ${formatNumber(jobs[user.economy.job].basePay)} WC\n` +
          `⭐ Nivel requerido: ${jobs[user.economy.job].level}`
        )
      }
      
      // Puede trabajar
      const jobInfo = jobs[user.economy.job]
      const basePay = jobInfo.basePay
      const levelBonus = Math.floor(basePay * (user.economy.workLevel * 0.1))
      const totalPay = basePay + levelBonus
      
      // Dar pago
      user.economy.waguri += totalPay
      user.economy.lastWork = now
      user.economy.totalEarned += totalPay
      user.economy.workXP = (user.economy.workXP || 0) + 1
      
      // Subir de nivel cada 10 trabajos
      if (user.economy.workXP >= 10) {
        user.economy.workLevel += 1
        user.economy.workXP = 0
      }
      
      // Registrar transacción
      if (!user.economy.transactions) user.economy.transactions = []
      user.economy.transactions.unshift({
        type: 'work',
        amount: totalPay,
        description: `Trabajo como ${jobInfo.name}`,
        date: new Date().toISOString(),
        timestamp: now
      })
      
      return m.reply(
        `✅ *TRABAJO COMPLETADO*\n\n` +
        `💼 Trabajo: ${jobInfo.name}\n` +
        `📝 ${jobInfo.description}\n\n` +
        `💰 *PAGO:*\n` +
        `• Base: ${formatNumber(basePay)} WC\n` +
        `• Bonus nivel ${user.economy.workLevel}: +${formatNumber(levelBonus)} WC\n` +
        `• Total: ${formatNumber(totalPay)} WC\n\n` +
        `💳 Saldo actual: ${formatNumber(user.economy.waguri)} WC\n` +
        `⭐ Nivel trabajo: ${user.economy.workLevel}\n` +
        `📈 Experiencia: ${user.economy.workXP || 0}/10\n\n` +
        `⏰ Próximo trabajo en ${jobInfo.cooldown / (60 * 60 * 1000)} horas`
      )
    }
    
    // Mostrar lista de trabajos
    let jobsList = `💼 *TRABAJOS DISPONIBLES*\n\n`
    jobsList += `👤 Tu nivel: ${user.economy.workLevel || 1}\n\n`
    
    Object.entries(jobs).forEach(([id, job]) => {
      const canWork = (user.economy.workLevel || 1) >= job.level
      const status = canWork ? '🟢' : '🔴'
      
      jobsList += `${status} *${job.name}*\n`
      jobsList += `   📝 ${job.description}\n`
      jobsList += `   💰 Pago: ${formatNumber(job.basePay)} WC\n`
      jobsList += `   ⏰ Cooldown: ${job.cooldown / (60 * 60 * 1000)}h\n`
      jobsList += `   ⭐ Nivel: ${job.level}\n`
      
      if (!canWork) {
        jobsList += `   🔒 Necesitas nivel ${job.level}\n`
      } else if (!user.economy.job) {
        jobsList += `   🔧 ${usedPrefix}trabajar ${id}\n`
      }
      
      jobsList += `\n`
    })
    
    if (user.economy.job) {
      jobsList += `📌 *TRABAJO ACTUAL:* ${jobs[user.economy.job].name}\n`
      jobsList += `Usa ${usedPrefix}trabajar para trabajar\n`
    } else {
      jobsList += `📌 *EJEMPLO:* ${usedPrefix}trabajar repartidor\n`
    }
    
    return m.reply(jobsList)
  }
  
  // Buscar trabajo específico
  const jobId = args[0].toLowerCase()
  const job = jobs[jobId]
  
  if (!job) {
    return m.reply(
      `❌ *TRABAJO NO ENCONTRADO*\n\n` +
      `Trabajos disponibles:\n` +
      `• repartidor\n` +
      `• constructor\n` +
      `• programador\n` +
      `• doctor\n` +
      `• ceo\n\n` +
      `📌 Ejemplo: ${usedPrefix}trabajar repartidor`
    )
  }
  
  // Verificar nivel
  if ((user.economy.workLevel || 1) < job.level) {
    return m.reply(
      `❌ *NIVEL INSUFICIENTE*\n\n` +
      `Necesitas nivel ${job.level}\n` +
      `Tu nivel: ${user.economy.workLevel || 1}\n\n` +
      `💡 Sube de nivel trabajando en otros empleos.`
    )
  }
  
  // Ya tiene trabajo
  if (user.economy.job) {
    return m.reply(
      `⚠️ *YA TIENES TRABAJO*\n\n` +
      `Trabajo actual: ${jobs[user.economy.job].name}\n\n` +
      `Si quieres cambiar de trabajo:\n` +
      `${usedPrefix}renunciar\n` +
      `Luego: ${usedPrefix}trabajar ${jobId}`
    )
  }
  
  // Asignar trabajo
  user.economy.job = jobId
  
  await m.reply(
    `✅ *TRABAJO CONSEGUIDO*\n\n` +
    `💼 ${job.name}\n` +
    `📝 ${job.description}\n\n` +
    `💰 Pago: ${formatNumber(job.basePay)} WC\n` +
    `⏰ Cooldown: ${job.cooldown / (60 * 60 * 1000)} horas\n` +
    `⭐ Nivel requerido: ${job.level}\n\n` +
    `🔧 *Para trabajar:* ${usedPrefix}trabajar\n` +
    `💡 Trabaja regularmente para subir de nivel y ganar más.`
  )
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    workLevel: 1,
    workXP: 0,
    job: null,
    lastWork: 0,
    totalEarned: 1000
  }
}

handler.help = ['trabajar [trabajo]', 'work']
handler.tags = ['economy']
handler.command = /^(trabajar|work|job)$/i
handler.group = true
handler.register = true

export default handler