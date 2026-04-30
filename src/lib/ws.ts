import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import api from './api'

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://podium-api-production.up.railway.app/api/v1/ws'

class MobileWSManager {
  private ws: WebSocket | null = null
  private handlers = new Set<Function>()
  private reconnectTimer: any = null
  private reconnectDelay = 1500
  private shouldConnect = false
  private subs = new Set<string>()
  private token: string | null = null

  async connect() {
    this.shouldConnect = true
    this.token = await api.getToken()
    this._connect(this.token ? `${WS_URL}?token=${this.token}` : WS_URL)
  }

  private _connect(url: string) {
    try { this.ws = new WebSocket(url) } catch { this._reconnect(); return }
    this.ws.onopen = () => {
      this.reconnectDelay = 1500
      this.subs.forEach(b => this.send({ type: 'subscribe', boardId: b, timestamp: new Date().toISOString() }))
    }
    this.ws.onmessage = e => {
      try {
        const m = JSON.parse(e.data)
        if (m.type === 'ping') { this.send({ type: 'pong', timestamp: new Date().toISOString() }); return }
        this._notify(m)
      } catch {}
    }
    this.ws.onclose = () => { if (this.shouldConnect) this._reconnect() }
    this.ws.onerror = () => this.ws?.close()
  }

  private _reconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000)
      if (this.token) this._connect(`${WS_URL}?token=${this.token}`)
    }, this.reconnectDelay)
  }

  disconnect() {
    this.shouldConnect = false
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close(); this.ws = null
  }

  send(m: any) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m))
  }

  subscribe(b: string) { this.subs.add(b); this.send({ type: 'subscribe', boardId: b, timestamp: new Date().toISOString() }) }
  unsubscribe(b: string) { this.subs.delete(b); this.send({ type: 'unsubscribe', boardId: b, timestamp: new Date().toISOString() }) }
  addHandler(h: Function) { this.handlers.add(h); return () => this.handlers.delete(h) }
  private _notify(m: any) { this.handlers.forEach(h => h(m)) }
  get isConnected() { return this.ws?.readyState === WebSocket.OPEN }
}

export const wsManager = new MobileWSManager()
AppState.addEventListener('change', st => { if (st === 'active') wsManager.connect(); else wsManager.disconnect() })

export function useBoardRealtime(boardId: string | null, handlers: { onRankUpdate?: (p: any) => void; onScoreSubmitted?: (p: any) => void; onViewerCount?: (p: any) => void }) {
  const ref = useRef(handlers); ref.current = handlers
  useEffect(() => {
    if (!boardId) return
    wsManager.subscribe(boardId)
    const rm = wsManager.addHandler((m: any) => {
      if (m.boardId !== boardId) return
      const h = ref.current
      if (m.type === 'rank_update' && h.onRankUpdate) h.onRankUpdate(m.payload)
      if (m.type === 'score_submitted' && h.onScoreSubmitted) h.onScoreSubmitted(m.payload)
      if (m.type === 'viewer_count' && h.onViewerCount) h.onViewerCount(m.payload)
    })
    return () => { wsManager.unsubscribe(boardId); rm() }
  }, [boardId])
}
