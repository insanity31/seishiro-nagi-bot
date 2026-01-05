let handler = async (m, { conn, usedPrefix, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter || !user.cyberHunter.inventory) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  if (!args[0]) {
    return m.reply(
      `📌 Usa: ${usedPrefix}vender <item> [cantidad]\n` +
      `📋 Ejemplos:\n` +
      `${usedPrefix}vender data_chip\n` +
      `${usedPrefix}vender data_chip 2\n\n` +
      `💰 Items vendibles:\n` +
      `• data_chip - 💿 Chip de Datos (200 créditos)\n` +
      `• scrap_metal - 🔩 Metal Chatarra (50 créditos)\n` +
      `• cyber_component - ⚙️ Componente Cyber (100 créditos)`
    )
  }
  
  const itemId = args[0].toLowerCase()
  const quantity = args[1] ? parseInt(args[1]) : 1
  
  if (isNaN(quantity) || quantity <= 0) {
    return m.reply('❌ La cantidad debe ser un número mayor a 0.')
  }
  
  const inventory = user.cyberHunter.inventory
  const itemIndex = inventory.findIndex(item => item.id === itemId)
  
  if (itemIndex === -1) {
    return m.reply(`❌ No tienes "${itemId}" en tu inventario.`)
  }
  
  const item = inventory[itemIndex]
  
  // Verificar si es vendible
  if (item.type !== 'valuable' && item.type !== 'material') {
    return m.reply(`❌ "${item.name}" no es vendible.\nSolo puedes vender valuables y materiales.`)
  }
  
  // Verificar cantidad disponible
  if (item.quantity < quantity) {
    return m.reply(
      `❌ Cantidad insuficiente.\n` +
      `Tienes: ${item.quantity} ${item.name}\n` +
      `Intentas vender: ${quantity}`
    )
  }
  
  // Calcular valor de venta
  const itemValues = {
    'data_chip': 200,
    'scrap_metal': 50,
    'cyber_component': 100,
    'rare_circuit': 300,
    'quantum_core': 500
  }
  
  const unitValue = itemValues[itemId] || 100
  const totalValue = unitValue * quantity
  
  // Realizar venta
  user.credit = (user.credit || 0) + totalValue
  item.quantity -= quantity
  
  // Si la cantidad llega a 0, eliminar el item
  if (item.quantity <= 0) {
    inventory.splice(itemIndex, 1)
  }
  
  await m.reply(
    `💰 *VENTA EXITOSA*\n\n` +
    `🎯 Item: ${item.name}\n` +
    `📦 Cantidad vendida: ${quantity}\n` +
    `💵 Valor unitario: ${unitValue} créditos\n` +
    `💰 Total obtenido: ${totalValue} créditos\n` +
    `📦 Restante: ${item.quantity > 0 ? item.quantity : '0'}\n\n` +
    `💳 Nuevo saldo: ${user.credit} ⚡\n` +
    `🏪 Transacción registrada en el mercado negro.`
  )
}

handler.help = ['vender', 'sell', 'vend']
handler.tags = ['rpg']
handler.command = /^(vender|sell|vend)$/i
handler.group = true
handler.register = true

export default handler