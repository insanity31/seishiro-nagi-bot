let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar si no existe
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
      inventory: []
    }
  }
  
  // Inicializar inventario si no existe
  if (!user.cyberHunter.inventory) {
    user.cyberHunter.inventory = [
      { id: 'potion', name: '🍶 Poción de Energía', quantity: 3, type: 'consumable' },
      { id: 'data_chip', name: '💿 Chip de Datos', quantity: 1, type: 'valuable' },
      { id: 'basic_armor', name: '🛡️ Armadura Básica', quantity: 1, type: 'equipment' }
    ]
  }
  
  // Inicializar equipo equipado si no existe
  if (!user.cyberHunter.equipped) {
    user.cyberHunter.equipped = {
      weapon: null,
      armor: 'basic_armor',
      implant: null,
      accessory: null
    }
  }
  
  // Tipos de items con emojis
  const itemCategories = {
    consumable: '🍶 Consumibles',
    equipment: '⚔️ Equipo',
    valuable: '💰 Valuables',
    material: '🔩 Materiales',
    special: '🎁 Especiales'
  }
  
  // Mapeo de efectos de items
  const itemEffects = {
    'potion': 'Restaura 30 HP',
    'data_chip': 'Vendible por 200 créditos',
    'basic_armor': '+5 DEF',
    'energy_drink': '+10 ATK por 1 misión',
    'cyber_eye': '+5% chance de crítico',
    'neural_chip': '+10% EXP',
    'stealth_module': '+15% escape',
    'quantum_battery': 'Restaura HP al máximo',
    'hacker_toolkit': '+25% recompensa hack',
    'corporate_pass': 'Acceso a zonas restringidas'
  }
  
  let inventoryMessage = []
  inventoryMessage.push(`🎒 *INVENTARIO CYBER - ALMACÉN NEURAL* 🎒`)
  inventoryMessage.push(`👤 Cazador: ${user.name || 'Anónimo'}`)
  inventoryMessage.push(`📦 Espacio: ${user.cyberHunter.inventory.length}/25 slots`)
  inventoryMessage.push(`💾 Sistema: Almacenamiento cuántico`)
  inventoryMessage.push(``)
  
  // Mostrar equipo equipado
  inventoryMessage.push(`⚡ *EQUIPO ACTIVO* ⚡`)
  
  const equipmentSlots = {
    weapon: { name: '🔫 Arma', emoji: '🔫' },
    armor: { name: '🛡️ Armadura', emoji: '🛡️' },
    implant: { name: '💾 Implante', emoji: '💾' },
    accessory: { name: '✨ Accesorio', emoji: '✨' }
  }
  
  let hasEquipment = false
  Object.entries(equipmentSlots).forEach(([slot, data]) => {
    const itemId = user.cyberHunter.equipped[slot]
    if (itemId) {
      hasEquipment = true
      const item = user.cyberHunter.inventory.find(i => i.id === itemId)
      if (item) {
        inventoryMessage.push(`${data.emoji} ${data.name}: ${item.name}`)
        if (itemEffects[item.id]) {
          inventoryMessage.push(`   ⚡ Efecto: ${itemEffects[item.id]}`)
        }
      }
    } else {
      inventoryMessage.push(`${data.emoji} ${data.name}: Vacío`)
    }
  })
  
  if (!hasEquipment) {
    inventoryMessage.push(`📭 Sin equipo activo - usa items para equiparlos`)
  }
  
  inventoryMessage.push(``)
  
  // Agrupar items por categoría
  const itemsByCategory = {}
  user.cyberHunter.inventory.forEach(item => {
    if (!itemsByCategory[item.type]) {
      itemsByCategory[item.type] = []
    }
    itemsByCategory[item.type].push(item)
  })
  
  // Mostrar items por categoría
  let hasItems = false
  Object.entries(itemCategories).forEach(([type, categoryName]) => {
    if (itemsByCategory[type] && itemsByCategory[type].length > 0) {
      hasItems = true
      inventoryMessage.push(`${categoryName}:`)
      
      itemsByCategory[type].forEach(item => {
        const isEquipped = Object.values(user.cyberHunter.equipped).includes(item.id)
        const equippedMark = isEquipped ? ' ✅' : ''
        
        inventoryMessage.push(`  ${item.name} x${item.quantity}${equippedMark}`)
        
        // Mostrar efecto del item
        if (itemEffects[item.id]) {
          inventoryMessage.push(`     ⚡ ${itemEffects[item.id]}`)
        }
        
        // Mostrar comandos para usar/equipar
        if (item.type === 'consumable') {
          inventoryMessage.push(`     🔧 ${usedPrefix}usar ${item.id}`)
        } else if (item.type === 'equipment') {
          if (isEquipped) {
            inventoryMessage.push(`     🔧 ${usedPrefix}desequipar ${item.id}`)
          } else {
            inventoryMessage.push(`     🔧 ${usedPrefix}equipar ${item.id}`)
          }
        } else if (item.type === 'valuable') {
          inventoryMessage.push(`     🔧 ${usedPrefix}vender ${item.id}`)
        }
      })
      
      inventoryMessage.push(``)
    }
  })
  
  if (!hasItems) {
    inventoryMessage.push(`📭 Inventario vacío`)
    inventoryMessage.push(`💡 Consigue items en misiones usando /cazar`)
    inventoryMessage.push(``)
  }
  
  // Mostrar stats mejoradas por equipo
  const equippedBonus = calculateEquipmentBonus(user.cyberHunter)
  if (equippedBonus.attack > 0 || equippedBonus.defense > 0 || equippedBonus.hp > 0) {
    inventoryMessage.push(`✨ *BONUS DE EQUIPO* ✨`)
    
    if (equippedBonus.attack > 0) {
      inventoryMessage.push(`⚔️ ATK Bonus: +${equippedBonus.attack}`)
    }
    if (equippedBonus.defense > 0) {
      inventoryMessage.push(`🛡️ DEF Bonus: +${equippedBonus.defense}`)
    }
    if (equippedBonus.hp > 0) {
      inventoryMessage.push(`❤️ HP Bonus: +${equippedBonus.hp}`)
    }
    if (equippedBonus.critical > 0) {
      inventoryMessage.push(`💥 Crítico Bonus: +${equippedBonus.critical}%`)
    }
    
    inventoryMessage.push(``)
  }
  
  // Items recomendados basados en nivel
  inventoryMessage.push(`💡 *RECOMENDACIONES*`)
  
  if (user.cyberHunter.level < 5) {
    inventoryMessage.push(`🎯 Para nivel ${user.cyberHunter.level}: Equipa armadura básica`)
  } else if (user.cyberHunter.level < 10) {
    inventoryMessage.push(`🎯 Para nivel ${user.cyberHunter.level}: Busca armadura mejorada`)
  } else {
    inventoryMessage.push(`🎯 Para nivel ${user.cyberHunter.level}: Equipo cybernético avanzado`)
  }
  
  // Próximo item especial disponible
  const nextSpecialLevel = Math.ceil(user.cyberHunter.level / 5) * 5
  if (nextSpecialLevel > user.cyberHunter.level) {
    inventoryMessage.push(`🚀 Desbloquea items especiales en nivel ${nextSpecialLevel}`)
  }
  
  inventoryMessage.push(``)
  
  // Comandos relacionados
  inventoryMessage.push(`🔧 *COMANDOS DE INVENTARIO*`)
  inventoryMessage.push(`• ${usedPrefix}usar <item> - Usar consumible`)
  inventoryMessage.push(`• ${usedPrefix}equipar <item> - Equipar item`)
  inventoryMessage.push(`• ${usedPrefix}desequipar <item> - Remover item`)
  inventoryMessage.push(`• ${usedPrefix}vender <item> - Vender valuable`)
  inventoryMessage.push(`• ${usedPrefix}craft <item> - Crear item (próximamente)`)
  inventoryMessage.push(``)
  inventoryMessage.push(`📦 *CONSEJOS:*`)
  inventoryMessage.push(`• Usa pociones cuando tengas poco HP`)
  inventoryMessage.push(`• Equipa armaduras para aumentar DEF`)
  inventoryMessage.push(`• Vende chips de datos por créditos`)
  inventoryMessage.push(`• Guarda items raros para misiones difíciles`)
  
  await m.reply(inventoryMessage.join('\n'))
  
  // Función auxiliar para calcular bonus de equipo
  function calculateEquipmentBonus(cyberData) {
    const bonus = { attack: 0, defense: 0, hp: 0, critical: 0 }
    
    // Revisar cada slot equipado
    Object.values(cyberData.equipped).forEach(itemId => {
      if (!itemId) return
      
      // Bonus por tipo de item
      switch (itemId) {
        case 'basic_armor':
          bonus.defense += 5
          break
        case 'cyber_eye':
          bonus.critical += 5
          break
        case 'neural_chip':
          // Bonus de EXP se maneja aparte
          break
        case 'stealth_module':
          // Bonus de escape se maneja aparte
          break
        case 'energy_drink':
          // Efecto temporal
          break
      }
    })
    
    return bonus
  }
}

handler.help = ['inventario', 'inventory', 'inv', 'items', 'equipo']
handler.tags = ['rpg']
handler.command = /^(inventario|inventory|inv|items|equipo|mochila)$/i
handler.group = true
handler.register = true

export default handler