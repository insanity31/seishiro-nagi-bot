let handler = async (m, { conn, mentionedJid, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  // Verificar si mencionaron a alguien y especificaron cantidad
  if (!mentionedJid || mentionedJid.length === 0 || !args[0]) {
    return m.reply(
      `📌 Uso correcto:\n` +
      `${usedPrefix}transferir @usuario cantidad\n\n` +
      `📌 Ejemplo:\n` +
      `${usedPrefix}transferir @amigo 500`
    )
  }
  
  const receiverJid = mentionedJid[0]
  const amount = parseInt(args[0])
  
  if (receiverJid === m.sender) {
    return m.reply('❌ No puedes transferirte a ti mismo.')
  }
  
  if (isNaN(amount) || amount <= 0) {
    return m.reply('❌ La cantidad debe ser un número mayor a 0.')
  }
  
  if (amount > 10000) {
    return m.reply('❌ Límite de transferencia: 10,000 créditos por operación.')
  }
  
  // Comisión del 5%
  const commission = Math.ceil(amount * 0.05)
  const totalDeduction = amount + commission
  
  if ((user.credit || 0) < totalDeduction) {
    return m.reply(
      `❌ Créditos insuficientes.\n` +
      `Necesitas: ${totalDeduction} ⚡ (${amount} + ${commission} comisión)\n` +
      `Tienes: ${user.credit || 0} ⚡`
    )
  }
  
  const receiver = global.db.data.users[receiverJid]
  
  if (!receiver) {
    return m.reply('❌ El usuario receptor no existe en la base de datos.')
  }
  
  // Realizar transferencia
  user.credit -= totalDeduction
  receiver.credit = (receiver.credit || 0) + amount
  
  // Registrar transacción
  if (!user.transactions) user.transactions = []
  if (!receiver.transactions) receiver.transactions = []
  
  user.transactions.push({
    type: 'sent',
    to: receiverJid,
    amount: amount,
    commission: commission,
    date: new Date().toISOString()
  })
  
  receiver.transactions.push({
    type: 'received',
    from: m.sender,
    amount: amount,
    date: new Date().toISOString()
  })
  
  // Notificar a ambos
  const senderName = conn.getName(m.sender)
  const receiverName = conn.getName(receiverJid)
  
  const transferMessage = 
    `💸 *TRANSFERENCIA EXITOSA*\n\n` +
    `👤 De: ${senderName}\n` +
    `👤 Para: ${receiverName}\n` +
    `💰 Cantidad: ${amount} ⚡\n` +
    `🏦 Comisión: ${commission} ⚡\n` +
    `📊 Total debitado: ${totalDeduction} ⚡\n\n` +
    `💳 Tu saldo actual: ${user.credit} ⚡`
  
  await conn.sendMessage(m.chat, {
    text: transferMessage,
    mentions: [m.sender, receiverJid]
  }, { quoted: m })
  
  // Notificar al receptor si está en otro chat
  try {
    const receiverMessage = 
      `🎉 *RECIBISTE UNA TRANSFERENCIA*\n\n` +
      `👤 De: ${senderName}\n` +
      `💰 Cantidad: ${amount} ⚡\n` +
      `💳 Tu nuevo saldo: ${receiver.credit} ⚡\n\n` +
      `💌 Mensaje: Recibiste créditos en Neo-Tokyo Network`
    
    await conn.sendMessage(receiverJid, { text: receiverMessage })
  } catch (e) {
    console.log('No se pudo notificar al receptor:', e)
  }
}

handler.help = ['transferir', 'transfer', 'pay', 'pagar']
handler.tags = ['rpg']
handler.command = /^(transferir|transfer|pay|pagar|enviar)$/i
handler.group = true
handler.register = true

export default handler