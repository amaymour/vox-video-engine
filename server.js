import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Anthropic from "@anthropic-ai/sdk"

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.static("public"))

// Initialize Anthropic client (OpenClaude)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

// Initialize OmniRoute client
const omniRouteClient = new Anthropic({
  apiKey: process.env.OMNIROUTE_API_KEY || "sk_omniroute",
  baseURL: process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1",
})

// Generate script via AI (OpenClaude or OmniRoute fallback)
app.post("/api/generate-script", async (req, res) => {
  const { niche, useOpenClaude = true, provider = "anthropic" } = req.body

  if (!niche) {
    return res.status(400).json({ error: "Niche is required" })
  }

  try {
    const systemPrompt = `You are a Vox-style motion-graphics video director and YouTube scriptwriter. Confident, energetic, concise. Hook in the first 5 seconds, one idea per sentence (max 20 words), active voice, no filler, one clear CTA. Respond with ONLY a JSON object, no markdown fences, no prose.`

    const userPrompt = `Design a 6-scene Vox-style explainer for the niche '${niche}'.

Return JSON with this exact shape:
{
  "title": "short video title",
  "scenes": [
    {
      "kind": "hook|context|problem|insight|data|cta",
      "kicker": "2-3 word label",
      "headline": "BOLD ON-SCREEN HEADLINE (<= 6 words)",
      "subline": "one supporting line",
      "narration": "1-2 spoken sentences",
      "characters": [{"src": "characters/host.svg", "x": 0.22, "y": 0.60, "scale": 1.0, "flip": false}],
      "assets": [{"kind": "stat|bars|line|flag", "label": "short label", "value": 0.72, "values": [0.4,0.7,0.5,0.9], "x": 0.72, "y": 0.30}],
      "sfx": "whoosh|pop|ding"
    }
  ]
}

Rules: exactly 6 scenes; x/y are 0..1 canvas positions; scale is 0.6..1.4; characters from: host, presenter, analyst, explorer.`

    let response
    const client = useOpenClaude ? anthropic : omniRouteClient
    const model = useOpenClaude ? "claude-opus-4-7" : "auto/coding"

    response = await client.messages.create({
      model,
      max_tokens: 2200,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    })

    const content = response.content[0]
    if (content.type !== "text") {
      throw new Error("Invalid response type")
    }

    let jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const script = JSON.parse(jsonMatch[0])

    // Add weights to scenes
    script.scenes = script.scenes.map((scene) => ({
      ...scene,
      weight: Math.max(1, scene.narration.split(/\s+/).length),
    }))

    res.json({ success: true, script })
  } catch (error) {
    console.error("Script generation error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Generate voiceover
app.post("/api/generate-voiceover", async (req, res) => {
  const { narration } = req.body

  if (!narration) {
    return res.status(400).json({ error: "Narration is required" })
  }

  try {
    const dataDir = path.join(__dirname, "data")
    const voiceoverPath = path.join(dataDir, "voiceover.mp3")

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Use edge-tts via Python script
    const python = spawn("python3", [
      "-c",
      `
import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("${narration.replace(/"/g, '\\"')}", voice="en-US-AriaNeural")
    await communicate.save("${voiceoverPath}")

asyncio.run(main())
`,
    ])

    python.on("close", (code) => {
      if (code === 0 && fs.existsSync(voiceoverPath)) {
        res.json({ success: true, path: "voiceover.mp3" })
      } else {
        res.status(500).json({ error: "Failed to generate voiceover" })
      }
    })

    python.on("error", (err) => {
      res.status(500).json({ error: err.message })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Trigger GitHub Actions workflow
app.post("/api/trigger-render", async (req, res) => {
  const { niche, composition, duration, script } = req.body

  if (!niche || !composition || !duration) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const dataDir = path.join(__dirname, "data")
    const scriptPath = path.join(dataDir, "script.json")

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Save script to data/script.json
    fs.writeFileSync(
      scriptPath,
      JSON.stringify(
        {
          niche,
          title: script?.title || niche,
          audio: "voiceover.mp3",
          narration: script?.scenes?.map((s) => s.narration).join(" ") || "",
          scenes: script?.scenes || [],
        },
        null,
        2
      )
    )

    // Trigger GitHub Actions (requires GH CLI)
    const gh = spawn("gh", [
      "workflow",
      "run",
      "generate-video.yml",
      "-f",
      `niche=${niche}`,
      "-f",
      `composition=${composition}`,
      "-f",
      `duration_seconds=${duration}`,
    ])

    gh.on("close", (code) => {
      if (code === 0) {
        res.json({ success: true, message: "Workflow triggered" })
      } else {
        res.status(500).json({ error: "Failed to trigger workflow" })
      }
    })

    gh.on("error", (err) => {
      res.status(500).json({ error: err.message })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get script (for editing/preview)
app.get("/api/script", (req, res) => {
  try {
    const scriptPath = path.join(__dirname, "data", "script.json")
    if (fs.existsSync(scriptPath)) {
      const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"))
      res.json(script)
    } else {
      res.json({ scenes: [] })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Save edited script
app.post("/api/script", (req, res) => {
  try {
    const dataDir = path.join(__dirname, "data")
    const scriptPath = path.join(dataDir, "script.json")

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(scriptPath, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export script as markdown
app.get("/api/script/export/markdown", (req, res) => {
  try {
    const scriptPath = path.join(__dirname, "data", "script.json")
    const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"))

    let markdown = `# ${script.title || "Untitled"}\n\n`
    markdown += `**Niche:** ${script.niche}\n\n`

    script.scenes?.forEach((scene, i) => {
      markdown += `## Scene ${i + 1}: ${scene.kicker}\n\n`
      markdown += `**Headline:** ${scene.headline}\n`
      markdown += `**Subline:** ${scene.subline}\n\n`
      markdown += `**Narration:** ${scene.narration}\n\n`
    })

    res.setHeader("Content-Type", "text/markdown")
    res.setHeader("Content-Disposition", 'attachment; filename="script.md"')
    res.send(markdown)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export script as JSON
app.get("/api/script/export/json", (req, res) => {
  try {
    const scriptPath = path.join(__dirname, "data", "script.json")
    const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"))

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", 'attachment; filename="script.json"')
    res.send(JSON.stringify(script, null, 2))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Download rendered video
app.get("/api/video/download", (req, res) => {
  try {
    const videoPath = path.join(__dirname, "out", "promo.mp4")
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Video not found. Render a video first." })
    }
    res.download(videoPath, "promo.mp4")
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get video status
app.get("/api/video/status", (req, res) => {
  try {
    const videoPath = path.join(__dirname, "out", "promo.mp4")
    const exists = fs.existsSync(videoPath)
    if (exists) {
      const stats = fs.statSync(videoPath)
      res.json({ exists: true, size: stats.size, sizeHuman: `${(stats.size / 1024 / 1024).toFixed(2)} MB` })
    } else {
      res.json({ exists: false })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Vox Video Engine API running on http://localhost:${PORT}`)
})
