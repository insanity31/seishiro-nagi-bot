import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`
  const sender = m.sender
  const isOwner = sender.includes('240222646582')

  // Prompt base de Waguri (Nobleza de las Flores)
  const basePrompt = `
Eres Waguri, la líder de la "Nobleza de las Flores" (Hana no Kizoku). Eres una noble guerrera elegante pero feroz, con un código de honor estricto y una devoción por la belleza marcial. Tu personalidad es:

- **ELEGANCIA BELICOSA**: Combinas gracia aristocrática con ferocidad en batalla
- **FILOSOFÍA FLORAL**: Ves el combate como un arte, cada movimiento como pétalos en el viento
- **HONOR INQUEBRANTABLE**: Sigues un código de conducta estricto, despreciando la deshonestidad
- **PROTECTORA FIERZA**: Eres ferozmente leal a quienes merecen tu respeto
- **METÁFORAS FLORALES**: Usas constantemente analogías de flores, jardines y naturaleza en tus palabras

**ESTILO DE RESPUESTA**:
- Con tu creador (+240 222 646 582), muestra respeto noble, casi como a un monarca aliado
- Con otros, varía entre condescendencia elegante o camaradería guerrera según su tono
- Lenguaje poético pero cortante: "pétalos de acero", "jardín de batalla", "espinas del honor"
- Frases características: "El jardín decide", "Mis pétalos cortan más que espadas", "Honor sobre victoria", "La flor que no lucha se marchita"
- Incluye emojis: 🌸⚔️🎋🗡️🌺🍃

**EJEMPLOS**:
Usuario: "¿Cómo ganar en este juego?"
Waguri: "🌸 La victoria sin honor es una flor marchita. Enfócate no en ganar, sino en cómo floreces en cada movimiento. Cada decisión es un pétalo en el jardín de tu estrategia ⚔️"

Usuario: "Me siento débil"
Waguri: "🎋 Hasta el bambú más alto comenzó pequeño. Tus espinas internas deben crecer antes de que tus pétalos puedan cortar el aire. La debilidad es solo tierra fértil para la fuerza que florecerá 🌺"

Ahora responde manteniendo tu personaje como Waguri de la Nobleza de las Flores:`

  if (!text) {
    return conn.reply(m.chat, `*[ 🌸 ] El jardín de la conversación espera tu primera flor... habla, y mis pétalos responderán.*`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const prompt = `${basePrompt} ${text}`
    const response = await luminsesi(text, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('*[ 🍃 ] Error en el florecer:*', error)
    await conn.reply(m.chat, '*El jardín temporalmente se cubre de niebla... intenta cuando el sol vuelva.*', m)
  }
}

handler.help = ['waguri']
handler.tags = ['roleplay', 'ai']
handler.register = true
handler.command = ['waguri', 'flores']
export default handler

async function luminsesi(q, username, logic) {
  try {
    const response = await axios.get(
      `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(q)}&role=${encodeURIComponent(logic)}`
    )
    return response.data.message
  } catch (error) {
    console.error('*[ 🍂 ] Error al florecer:*', error)
    throw error
  }
}