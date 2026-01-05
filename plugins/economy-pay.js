let handler = async (m, { conn, usedPrefix, command, args, mentionedJid }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) initEconomy(user)
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Comando: .pay @usuario cantidad
  if (command === 'pay' || command === 'pagar') {
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `💸 *PAGAR A USUARIO*\n\n` +
        `Uso: ${usedPrefix}pay @usuario <cantidad>\n` +
        `Ejemplo: ${usedPrefix}pay @amigo 500\n\n` +
        `💵 Tu saldo: ${formatNumber(user.economy.waguri)} WC\n` +
        `🏦 Banco: ${formatNumber(user.economy.bank)} WC`
      )
    }
    
    const targetJid = mentionedJid[0]
    
    if (targetJid === m.sender) {
      return m.reply('❌ No puedes pagarte a ti mismo.')
    }
    
    const amount = parseInt(args[0])
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida. Debe ser un número mayor a 0.')
    }
    
    if (amount > 100000) {
      return m.reply('❌ Límite de pago: 100,000 WC por operación.')
    }
    
    // Verificar fondos
    if (user.economy.waguri < amount) {
      // Intentar usar banco si no hay suficiente efectivo
      const totalAvailable = user.economy.waguri + user.economy.bank
      
      if (totalAvailable < amount) {
        return m.reply(
          `❌ *FONDOS INSUFICIENTES*\n\n` +
          `Quieres pagar: ${formatNumber(amount)} WC\n` +
          `Disponible: ${formatNumber(totalAvailable)} WC\n\n` +
          `💵 Efectivo: ${formatNumber(user.economy.waguri)}\n` +
          `🏦 Banco: ${formatNumber(user.economy.bank)}`
        )
      }
      
      // Usar banco para completar
      const fromBank = amount - user.economy.waguri
      user.economy.waguri = 0
      user.economy.bank -= fromBank
    } else {
      user.economy.waguri -= amount
    }
    
    // Verificar usuario receptor
    let targetUser = global.db.data.users[targetJid]
    if (!targetUser) {
      global.db.data.users[targetJid] = {}
      targetUser = global.db.data.users[targetJid]
    }
    
    if (!targetUser.economy) initEconomy(targetUser)
    
    // Pagar al receptor
    targetUser.economy.waguri += amount
    
    // Registrar transacciones
    if (!user.economy.transactions) user.economy.transactions = []
    user.economy.transactions.unshift({
      type: 'payment',
      amount: -amount,
      description: `Pago a @${targetJid.split('@')[0]}`,
      date: new Date().toISOString(),
      timestamp: Date.now()
    })
    
    if (!targetUser.economy.transactions) targetUser.economy.transactions = []
    targetUser.economy.transactions.unshift({
      type: 'payment',
      amount: amount,
      description: `Pago de @${m.sender.split('@')[0]}`,
      date: new Date().toISOString(),
      timestamp: Date.now()
    })
    
    const senderName = conn.getName(m.sender) || `@${m.sender.split('@')[0]}`
    const targetName = conn.getName(targetJid) || `@${targetJid.split('@')[0]}`
    
    // Mensaje al remitente
    await m.reply(
      `✅ *PAGO EXITOSO*\n\n` +
      `👤 Para: ${targetName}\n` +
      `💰 Cantidad: ${formatNumber(amount)} WC\n\n` +
      `💵 *Tu nuevo saldo:*\n` +
      `Efectivo: ${formatNumber(user.economy.waguri)} WC\n` +
      `Banco: ${formatNumber(user.economy.bank)} WC\n\n` +
      `📧 El usuario ha sido notificado.`
    )
    
    // Notificar al receptor
    try {
      await conn.sendMessage(targetJid, {
        text: `💰 *RECIBISTE UN PAGO*\n\n` +
              `👤 De: ${senderName}\n` +
              `💰 Cantidad: ${formatNumber(amount)} WC\n\n` +
              `💵 Tu nuevo saldo: ${formatNumber(targetUser.economy.waguri)} WC\n\n` +
              `🎉 ¡Pago recibido exitosamente!`
      })
    } catch (e) {
      console.log('No se pudo notificar al receptor:', e)
    }
    
    return
  }
  
  // Comando: .donar @usuario cantidad
  if (command === 'donar' || command === 'donate') {
    // Similar a .pay pero sin límites y con mensaje diferente
    if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
      return m.reply(
        `🎁 *DONAR A USUARIO*\n\n` +
        `Uso: ${usedPrefix}donar @usuario <cantidad>\n` +
        `Ejemplo: ${usedPrefix}donar @amigo 1000\n\n` +
        `💖 Donar es voluntario y sin condiciones.`
      )
    }
    
    const targetJid = mentionedJid[0]
    const amount = parseInt(args[0])
    
    if (targetJid === m.sender) {
      return m.reply('❌ No puedes donarte a ti mismo.')
    }
    
    if (isNaN(amount) || amount <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }
    
    if (user.economy.waguri < amount) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `Quieres donar: ${formatNumber(amount)} WC\n` +
        `Tienes: ${formatNumber(user.economy.waguri)} WC`
      )
    }
    
    user.economy.waguri -= amount
    
    let targetUser = global.db.data.users[targetJid]
    if (!targetUser) {
      global.db.data.users[targetJid] = {}
      targetUser = global.db.data.users[targetJid]
    }
    
    if (!targetUser.economy) initEconomy(targetUser)
    
    targetUser.economy.waguri += amount
    
    await m.reply(
      `💖 *DONACIÓN EXITOSA*\n\n` +
      `👤 Donaste a: @${targetJid.split('@')[0]}\n` +
      `💰 Cantidad: ${formatNumber(amount)} WC\n\n` +
      `🎁 ¡Gracias por tu generosidad!\n` +
      `💫 El karma te devolverá algo bueno.`
    )
    
    return
  }
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    bank: 0,
    transactions: []
  }
}

handler.help = ['pay @usuario <cantidad>', 'pagar @usuario <cantidad>', 'donar @usuario <cantidad>']
handler.tags = ['economy']
handler.command = /^(pay|pagar|donar|donate)$/i
handler.group = true
handler.register = true

export default handler