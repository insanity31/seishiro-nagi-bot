import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    
    let timestamp = Date.now()
    let latensi = Date.now() - timestamp
    
    exec(`neofetch --stdout`, (error, stdout, stderr) => {
      let child = stdout.toString("utf-8")
      let ssd = child.replace(/Memory:/, "Ram:")
      

      let latenciaReal = Date.now() - timestamp
      
      conn.reply(m.chat, `⟡ *¡Pong!* ${latenciaReal.toFixed(4)}ms`, m, rcanal)
    })
  } catch (e) {
    console.log('Error en ping:', e)
  
    conn.reply(m.chat, `⟡ *¡Pong!* Latencia no disponible`, m)
  }
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler