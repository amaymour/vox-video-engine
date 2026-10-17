const { useState, useRef } = React

// Tabs component
const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-2 border-b border-purple-500/20 mb-6">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-6 py-3 font-semibold transition-all ${
          active === tab
            ? 'text-purple-400 border-b-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
)

// Loading spinner
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
)

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('Generate')
  const [niche, setNiche] = useState('AI Agents')
  const [composition, setComposition] = useState('NicheExplainer')
  const [duration, setDuration] = useState(60)
  const [useOpenClaude, setUseOpenClaude] = useState(true)
  const [loading, setLoading] = useState(false)
  const [script, setScript] = useState(null)
  const [narration, setNarration] = useState('')
  const [editingScene, setEditingScene] = useState(null)
  const [status, setStatus] = useState('')
  const [videoStatus, setVideoStatus] = useState(null)

  // Generate script
  const handleGenerateScript = async () => {
    setLoading(true)
    setStatus('🎬 Generating script...')
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, useOpenClaude }),
      })
      const data = await res.json()
      if (data.script) {
        setScript(data.script)
        const fullNarration = data.script.scenes
          .map(s => s.narration)
          .join(' ')
        setNarration(fullNarration)
        setStatus('✅ Script generated! Generate voiceover or edit scenes.')
      } else {
        setStatus('❌ Failed to generate script')
      }
    } catch (error) {
      setStatus('❌ ' + error.message)
    }
    setLoading(false)
  }

  // Generate voiceover
  const handleGenerateVoiceover = async () => {
    setLoading(true)
    setStatus('🎙️ Generating voiceover...')
    try {
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narration }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('✅ Voiceover generated!')
      } else {
        setStatus('❌ Failed to generate voiceover')
      }
    } catch (error) {
      setStatus('❌ ' + error.message)
    }
    setLoading(false)
  }

  // Trigger render
  const handleTriggerRender = async () => {
    setLoading(true)
    setStatus('🚀 Triggering GitHub Actions render...')
    try {
      const res = await fetch('/api/trigger-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, composition, duration, script }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('✅ Video render started! Check GitHub Actions.')
      } else {
        setStatus('❌ Failed to trigger render')
      }
    } catch (error) {
      setStatus('❌ ' + error.message)
    }
    setLoading(false)
  }

  // Save edited script
  const handleSaveScript = async () => {
    setLoading(true)
    setStatus('💾 Saving script...')
    try {
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(script),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('✅ Script saved!')
        setEditingScene(null)
      } else {
        setStatus('❌ Failed to save script')
      }
    } catch (error) {
      setStatus('❌ ' + error.message)
    }
    setLoading(false)
  }

  // Export script
  const handleExportScript = async (format) => {
    try {
      const url = `/api/script/export/${format}`
      const link = document.createElement('a')
      link.href = url
      link.click()
      setStatus(`✅ Script exported as ${format.toUpperCase()}`)
    } catch (error) {
      setStatus('❌ ' + error.message)
    }
  }

  // Check video status
  const checkVideoStatus = async () => {
    try {
      const res = await fetch('/api/video/status')
      const data = await res.json()
      setVideoStatus(data)
    } catch (error) {
      console.error('Failed to check video status:', error)
    }
  }

  // Download video
  const handleDownloadVideo = () => {
    const link = document.createElement('a')
    link.href = '/api/video/download'
    link.download = 'promo.mp4'
    link.click()
    setStatus('✅ Video download started!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-sm border-b border-purple-500/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black gradient-text mb-2">Vox Video Engine</h1>
              <p className="text-gray-400">AI-powered motion graphics generator • Generate SSS-grade videos in seconds</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-300">Ready to generate</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <Tabs tabs={['Generate', 'Edit Script', 'Settings']} active={activeTab} onChange={setActiveTab} />

        {/* Generate Tab */}
        {activeTab === 'Generate' && (
          <div className="animate-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Niche Input */}
              <div className="glass-card p-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">📍 Niche Keyword</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., AI Agents, SaaS Growth, Web3..."
                  className="w-full input-glow px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">Enter any topic—we'll fetch live trends and generate a script</p>
              </div>

              {/* Composition Selector */}
              <div className="glass-card p-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">🎬 Composition Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {['NicheExplainer', 'ViralDocumentary', 'KineticPromo'].map(comp => (
                    <button
                      key={comp}
                      onClick={() => setComposition(comp)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        composition === comp
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div className="glass-card p-6">
                <label className="block text-sm font-semibold text-purple-300 mb-4">⏱️ Duration: {duration}s</label>
                <input
                  type="range"
                  min="30"
                  max="60"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>30s (Quick)</span>
                  <span>60s (Full)</span>
                </div>
              </div>

              {/* AI Provider Selection */}
              <div className="glass-card p-6">
                <label className="block text-sm font-semibold text-purple-300 mb-3">🤖 AI Provider</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition">
                    <input
                      type="radio"
                      checked={useOpenClaude}
                      onChange={() => setUseOpenClaude(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      <span className="font-semibold gradient-accent-text">OpenClaude</span>
                      <span className="text-gray-400 ml-2">(Recommended - Fast & reliable)</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition">
                    <input
                      type="radio"
                      checked={!useOpenClaude}
                      onChange={() => setUseOpenClaude(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      <span className="font-semibold">OmniRoute/OpenCode</span>
                      <span className="text-gray-400 ml-2">(Free - Requires local setup)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGenerateScript}
                  disabled={loading}
                  className="glow-button px-6 py-4 rounded-lg text-white font-semibold disabled:opacity-50"
                >
                  {loading ? <Spinner /> : '✨ Generate Script'}
                </button>
                <button
                  onClick={handleGenerateVoiceover}
                  disabled={loading || !narration}
                  className="glow-button px-6 py-4 rounded-lg text-white font-semibold disabled:opacity-50"
                >
                  {loading ? <Spinner /> : '🎙️ Generate Voiceover'}
                </button>
              </div>

              <button
                onClick={handleTriggerRender}
                disabled={loading || !script}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 px-6 py-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {loading ? <Spinner /> : '🚀 Render Video on GitHub'}
              </button>
            </div>

            {/* Right: Preview & Status */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-6">
                <h3 className="text-lg font-bold gradient-text mb-4">📊 Preview</h3>

                {script && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Title</p>
                      <p className="text-sm font-semibold text-white mt-1">{script.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Scenes</p>
                      <p className="text-sm font-semibold text-purple-300">{script.scenes?.length || 0}</p>
                    </div>
                    <div className="border-t border-purple-500/20 pt-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Scene List</p>
                      <div className="space-y-1">
                        {script.scenes?.map((scene, i) => (
                          <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                            {i + 1}. {scene.kicker}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-200 font-semibold">💡 Status</p>
                  <p className="text-sm text-blue-100 mt-2">{status || 'Ready to generate script'}</p>
                </div>

                <button
                  onClick={checkVideoStatus}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                >
                  🎥 Check Video Status
                </button>

                {videoStatus?.exists && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-200 font-semibold">✅ Video Available</p>
                    <p className="text-sm text-green-100 mt-2">{videoStatus.sizeHuman}</p>
                    <button
                      onClick={handleDownloadVideo}
                      className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
                    >
                      📥 Download MP4
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Script Tab */}
        {activeTab === 'Edit Script' && (
          <div className="animate-in">
            {script ? (
              <div className="glass-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold gradient-text">{script.title}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportScript('markdown')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                    >
                      📄 Export MD
                    </button>
                    <button
                      onClick={() => handleExportScript('json')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                    >
                      📋 Export JSON
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {script.scenes?.map((scene, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-purple-500 pl-6 py-4 bg-gray-900/30 rounded-r-lg hover:bg-gray-900/50 transition cursor-pointer"
                      onClick={() => setEditingScene(i)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Scene {i + 1}: {scene.kicker}</h3>
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">{scene.kind}</span>
                      </div>
                      <p className="text-purple-300 font-semibold mb-2">{scene.headline}</p>
                      <p className="text-gray-300 text-sm">{scene.narration}</p>
                      <p className="text-gray-400 text-xs mt-3">Edit →</p>
                    </div>
                  ))}
                </div>

                {editingScene !== null && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
                    <div className="glass-card w-full max-w-2xl p-8 max-h-96 overflow-y-auto">
                      <h3 className="text-xl font-bold mb-4">Edit Scene {editingScene + 1}</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={script.scenes[editingScene].headline}
                          onChange={(e) => {
                            const updated = [...script.scenes]
                            updated[editingScene].headline = e.target.value
                            setScript({ ...script, scenes: updated })
                          }}
                          placeholder="Headline"
                          className="w-full input-glow px-4 py-2 rounded-lg text-white focus:outline-none"
                        />
                        <textarea
                          value={script.scenes[editingScene].narration}
                          onChange={(e) => {
                            const updated = [...script.scenes]
                            updated[editingScene].narration = e.target.value
                            setScript({ ...script, scenes: updated })
                          }}
                          placeholder="Narration"
                          className="w-full input-glow px-4 py-2 rounded-lg text-white focus:outline-none h-24"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveScript}
                            className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold transition"
                          >
                            ✅ Save
                          </button>
                          <button
                            onClick={() => setEditingScene(null)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-semibold transition"
                          >
                            ✕ Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-gray-400 text-lg">Generate a script first to edit scenes</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'Settings' && (
          <div className="animate-in glass-card p-8 max-w-2xl">
            <h2 className="text-2xl font-bold gradient-text mb-6">⚙️ Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-purple-300 mb-2">OpenClaude API Key</h3>
                <input
                  type="password"
                  placeholder="Enter your Anthropic API key"
                  className="w-full input-glow px-4 py-2 rounded-lg text-white focus:outline-none"
                  onChange={(e) => localStorage.setItem('ANTHROPIC_API_KEY', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-2">Get it from https://console.anthropic.com</p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">OmniRoute Base URL</h3>
                <input
                  type="text"
                  placeholder="http://localhost:20128/v1"
                  className="w-full input-glow px-4 py-2 rounded-lg text-white focus:outline-none"
                  defaultValue="http://localhost:20128/v1"
                  onChange={(e) => localStorage.setItem('OMNIROUTE_BASE_URL', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-2">Local OmniRoute instance (optional)</p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">GitHub Token</h3>
                <input
                  type="password"
                  placeholder="Enter your GitHub personal access token"
                  className="w-full input-glow px-4 py-2 rounded-lg text-white focus:outline-none"
                  onChange={(e) => localStorage.setItem('GITHUB_TOKEN', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-2">Required for triggering GitHub Actions workflows</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-200">
                  💡 Your settings are stored locally in your browser and never sent to any server except the configured APIs.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-purple-500/20 bg-black/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>Vox Video Engine — Powered by Remotion, Anthropic, OmniRoute, and GitHub Actions</p>
          <p className="mt-2">Generate unlimited SSS-grade motion-graphics videos for free</p>
        </div>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
