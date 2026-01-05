import { setTimeout } from 'timers/promises'

const CYBER_CONFIG = {
  cooldown: 300000,
  minReward: 50,
  maxReward: 300,
  criticalChance: 0.15,
  escapeChance: 0.25,
  bossChance: 0.05
}

const TARGETS = {
  common: [
    { name: "🤖 Dron de Seguridad Mk.III", hp: 80, attack: 25, reward: [50, 100], type: "Sistema Automatizado" },
    { name: "👨‍💼 Ejecutivo de Corporación", hp: 60, attack: 20, reward: [40, 80], type: "Humano Mejorado" },
    { name: "💉 Traficante de Neurochips", hp: 70, attack: 30, reward: [60, 120], type: "Criminal Cibernético" },
    { name: "🦾 Mercenario Cyborg", hp: 90, attack: 35, reward: [70, 140], type: "Soldado Mejorado" },
    { name: "🎭 Hacker Fantasma", hp: 65, attack: 40, reward: [55, 110], type: "Especialista Digital" }
  ],
  elite: [
    { name: "⚡ Androide de Asalto Alfa", hp: 300, attack: 80, reward: [500, 800], type: "Prototipo Militar" },
    { name: "👁️ Agente del Ojo Omnisciente", hp: 250, attack: 90, reward: [600, 900], type: "Inteligencia Artificial" },
    { name: "🌀 Tecnomante del Caos", hp: 280, attack: 75, reward: [550, 750], type: "Hacker Élite" },
    { name: "🔗 Síntesis Humano-Máquina", hp: 320, attack: 85, reward: [700, 1000], type: "Entidad Híbrida" }
  ]
}

const DISTRICTS = [
  "🏙️ Distrito Corporativo Megacorp",
  "🌃 Barrio de los Neon",
  "🔄 Plaza del Mercado de Chips",
  "⚙️ Zona Industrial Abandonada",
  "💾 Centro de Datos Central",
  "🏮 Callejón del Mercado Negro",
  "🌉 Puente Aéreo Transorbital",
  "🏢 Torres de Habitación Colectiva"
]

const RANDOM_EVENTS = [
  {
    name: "💰 Contrato Express",
    description: "¡Un cliente ofrece un pago inmediato por un trabajo sencillo!",
    reward: [200, 400],
    chance: 0.1
  },
  {
    name: "🔋 Encuentro de Energía",
    description: "¡Encuentras una fuente de energía que puedes vender!",
    reward: [100, 200],
    chance: 0.15
  },
  {
    name: "💿 Datos Valiosos",
    description: "¡Recuperas información clasificada y la vendes en el mercado negro!",
    reward: [300, 500],
    chance: 0.05
  }
]

let handler = async (m, { conn, usedPrefix, command }) => {
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
      credits: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0
    }
  }

  const now = Date.now()
  const cooldownTime = user.cyberHunter.lastMission + CYBER_CONFIG.cooldown

  if (now < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - now) / 1000 / 60)
    return m.reply(`⏰ Debes esperar ${remaining} minutos antes de tu próxima misión.`)
  }

  if (user.cyberHunter.hp < user.cyberHunter.maxHp) {
    user.cyberHunter.hp = user.cyberHunter.maxHp
  }

  const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)]

  for (let event of RANDOM_EVENTS) {
    if (Math.random() < event.chance) {
      const reward = Math.floor(Math.random() * (event.reward[1] - event.reward[0] + 1)) + event.reward[0]
      user.credit = (user.credit || 0) + reward
      user.cyberHunter.lastMission = now

      return m.reply(
        `🎮 **CYBER HUNTER RPG** 🎮\n\n` +
        `📍 **Distrito:** ${district}\n\n` +
        `✨ **Evento:** ${event.name}\n` +
        `📝 ${event.description}\n\n` +
        `💰 **Pago:** ${reward} créditos\n` +
        `💳 **Balance:** ${user.credit} créditos`
      )
    }
  }

  const isElite = Math.random() < CYBER_CONFIG.bossChance
  const targetList = isElite ? TARGETS.elite : TARGETS.common
  const target = targetList[Math.floor(Math.random() * targetList.length)]

  const missionTarget = {
    ...target,
    hp: target.hp
  }

  let missionLog = []
  missionLog.push(`🎮 *CYBER HUNTER RPG* 🎮`)
  missionLog.push(`📍 *Distrito:* ${district}`)
  missionLog.push(``)
  missionLog.push(`⚡ *¡MISIÓN DE CAZA!* ⚡`)
  missionLog.push(`${isElite ? "⚠️ *¡CONTRATO ÉLITE!* ⚠️" : ""}`)
  missionLog.push(`🎯 *Objetivo:* ${missionTarget.name}`)
  missionLog.push(`📊 *Tipo:* ${missionTarget.type}`)
  missionLog.push(`❤️ Integridad: ${missionTarget.hp} | ⚡ Daño: ${missionTarget.attack}`)
  missionLog.push(``)

  let turn = 1
  let missionSuccess = false

  while (user.cyberHunter.hp > 0 && missionTarget.hp > 0 && turn <= 10) {
    missionLog.push(`🔹 *Turno ${turn}*`)

    let playerDamage = user.cyberHunter.attack + Math.floor(Math.random() * 20) - 10
    const isCritical = Math.random() < CYBER_CONFIG.criticalChance

    if (isCritical) {
      playerDamage = Math.floor(playerDamage * 1.5)
      missionLog.push(`💥 *¡HACKEO CRÍTICO!*`)
    }

    playerDamage = Math.max(1, playerDamage)
    missionTarget.hp -= playerDamage

    missionLog.push(`⚔️ Atacas con ${playerDamage} de daño`)
    missionLog.push(`❤️ ${missionTarget.name}: ${Math.max(0, missionTarget.hp)} HP`)

    if (missionTarget.hp <= 0) {
      missionSuccess = true
      break
    }

    let targetDamage = missionTarget.attack + Math.floor(Math.random() * 15) - 7
    targetDamage = Math.max(1, targetDamage - user.cyberHunter.defense)

    user.cyberHunter.hp -= targetDamage

    missionLog.push(`🗡️ ${missionTarget.name} contraataca con ${targetDamage} de daño`)
    missionLog.push(`❤️ Tu HP: ${Math.max(0, user.cyberHunter.hp)}`)
    missionLog.push(``)

    turn++
  }

  user.cyberHunter.lastMission = now

  if (missionSuccess) {
    const baseReward = Math.floor(Math.random() * (target.reward[1] - target.reward[0] + 1)) + target.reward[0]
    const eliteBonus = isElite ? Math.floor(baseReward * 0.5) : 0
    const totalReward = baseReward + eliteBonus

    user.credit = (user.credit || 0) + totalReward
    user.cyberHunter.cyberware += isElite ? 50 : 25
    user.cyberHunter.reputation += isElite ? 15 : 5
    user.cyberHunter.missionsCompleted += 1

    const cyberwareNeeded = user.cyberHunter.level * 100
    if (user.cyberHunter.cyberware >= cyberwareNeeded) {
      user.cyberHunter.level += 1
      user.cyberHunter.cyberware = 0
      user.cyberHunter.maxHp += 20
      user.cyberHunter.hp = user.cyberHunter.maxHp
      user.cyberHunter.attack += 5
      user.cyberHunter.defense += 3

      const ranks = ["Novato", "Operativo", "Experto", "Élite", "Legendario"]
      if (user.cyberHunter.level <= ranks.length) {
        user.cyberHunter.rank = ranks[user.cyberHunter.level - 1]
      }

      missionLog.push(`🚀 *¡ASCENSO DE RANGO!* 🚀`)
      missionLog.push(`📊 *Rango:* ${user.cyberHunter.rank}`)
      missionLog.push(`📈 *Nivel:* ${user.cyberHunter.level}`)
      missionLog.push(`❤️ *HP Máximo:* ${user.cyberHunter.maxHp}`)
      missionLog.push(`⚔️ *Ataque:* ${user.cyberHunter.attack}`)
      missionLog.push(`🛡️ *Defensa:* ${user.cyberHunter.defense}`)
      missionLog.push(``)
    }

    missionLog.push(`✅ *¡MISIÓN EXITOSA!* ✅`)
    missionLog.push(`💰 *Recompensa:* ${totalReward} créditos ${eliteBonus > 0 ? `(+${eliteBonus} bonus élite)` : ''}`)
    missionLog.push(`💳 *Balance:* ${user.credit} créditos`)
    missionLog.push(`⚙️ *Cyberware:* +${isElite ? 50 : 25} (${user.cyberHunter.cyberware}/${user.cyberHunter.level * 100})`)
    missionLog.push(`🌟 *Reputación:* +${isElite ? 15 : 5} (Total: ${user.cyberHunter.reputation})`)

  } else {
    user.cyberHunter.missionsFailed += 1
    user.cyberHunter.hp = 0

    missionLog.push(`❌ *¡MISIÓN FALLIDA!* ❌`)
    missionLog.push(`💀 Sistema crítico dañado...`)
    missionLog.push(`🔧 La integridad se restaurará en la próxima misión`)
  }

  missionLog.push(``)
  missionLog.push(`📊 *TU PERFIL DE CAZADOR*`)
  missionLog.push(`🏅 Rango: ${user.cyberHunter.rank}`)
  missionLog.push(`📈 Nivel: ${user.cyberHunter.level}`)
  missionLog.push(`❤️ HP: ${user.cyberHunter.hp}/${user.cyberHunter.maxHp}`)
  missionLog.push(`⚔️ ATK: ${user.cyberHunter.attack} | 🛡️ DEF: ${user.cyberHunter.defense}`)
  missionLog.push(`✅ Misiones: ${user.cyberHunter.missionsCompleted} | ❌ Fallidas: ${user.cyberHunter.missionsFailed}`)
  missionLog.push(`🌟 Reputación: ${user.cyberHunter.reputation}`)

  await m.reply(missionLog.join('\n'))
}

handler.help = ['cazar', 'cyberhunt']
handler.tags = ['rpg']
handler.command = /^(cazar|cyberhunt|mision)$/i
handler.group = true
handler.register = true

export default handler