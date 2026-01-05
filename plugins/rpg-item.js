let handler = async (m, { conn, usedPrefix, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter || !user.cyberHunter.inventory) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil e inventario')
  }
  
  if (!args[0]) {
    return m.reply(
      `📌 Usa: ${usedPrefix}usar <item>\n` +
      `📋 Ejemplo: ${usedPrefix}usar potion\n\n` +
      `🎒 Items disponibles:\n` +
      `• potion - 🍶 Poción de Energía (restaura HP)\n` +
      `• energy_drink - ⚡ Bebida Energética (+ATK temporal)\n` +
      `• quantum_battery - 🔋 Batería Quantum (HP completo)`
    )
  }
  
  const itemId = args[0].toLowerCase()
  const inventory = user.cyberHunter.inventory
  
  // Buscar el item en el inventario
  const itemIndex = inventory.findIndex(item => item.id === itemId)
  
  if (itemIndex === -1) {
    return m.reply(`❌ No tienes "${itemId}" en tu inventario.\nUsa ${usedPrefix}inventario para ver tus items.`)
  }
  
  const item = inventory[itemIndex]
  
  // Verificar si es consumible
  if (item.type !== 'consumable') {
    return m.reply(`❌ "${item.name}" no es un consumible.\nSolo puedes usar items tipo consumible.`)
  }
  
  // Aplicar efecto del item
  let effectMessage = ''
  let success = true
  
  switch (itemId) {
    case 'potion':
      const healAmount = 30
      const newHP = Math.min(user.cyberHunter.maxHp, user.cyberHunter.hp + healAmount)
      const actualHeal = newHP - user.cyberHunter.hp
      user.cyberHunter.hp = newHP
      effectMessage = `❤️ Restaurado ${actualHeal} HP (${user.cyberHunter.hp}/${user.cyberHunter.maxHp})`
      break
      
    case 'energy_drink':
      // Efecto temporal (se guarda en variable temporal)
      if (!user.cyberHunter.tempEffects) user.cyberHunter.tempEffects = {}
      user.cyberHunter.tempEffects.attackBonus = {
        amount: 10,
        expires: Date.now() + (60 * 60 * 1000) // 1 hora
      }
      effectMessage = `⚔️ +10 ATK por 1 hora`
      break
      
    case 'quantum_battery':
      user.cyberHunter.hp = user.cyberHunter.maxHp
      effectMessage = `⚡ HP restaurado al máximo: ${user.cyberHunter.hp}/${user.cyberHunter.maxHp}`
      break
      
    default:
      success = false
      effectMessage = '⚠️ Este item no tiene efecto definido'
  }
  
  if (success) {
    // Reducir cantidad del item
    item.quantity -= 1
    
    // Si la cantidad llega a 0, eliminar el item
    if (item.quantity <= 0) {
      inventory.splice(itemIndex, 1)
    }
    
    await m.reply(
      `✅ *ITEM USADO*\n\n` +
      `🎯 Item: ${item.name}\n` +
      `✨ Efecto: ${effectMessage}\n` +
      `📦 Cantidad restante: ${item.quantity > 0 ? item.quantity : '0'}\n\n` +
      `💡 Efecto aplicado a tu sistema.`
    )
  } else {
    await m.reply(`❌ No se pudo usar el item: ${effectMessage}`)
  }
}

handler.help = ['usar', 'use', 'consumir']
handler.tags = ['rpg']
handler.command = /^(usar|use|consumir)$/i
handler.group = true
handler.register = true

export default handler