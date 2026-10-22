import { describe, expect, it } from 'vitest'
import { LIVES, pickLive, sceneAt } from '@/data/live'
import { getSummary } from '@/lib/commerce/catalog'

describe('live: sorteio', () => {
  it('nunca repete a live anterior', () => {
    for (const prev of LIVES.map((l) => l.id)) {
      for (const r of [0, 0.34, 0.5, 0.99]) expect(pickLive(prev, null, () => r)!.id).not.toBe(prev)
    }
  })
  it('?live=N força, ?live=off desliga', () => {
    expect(pickLive('live-1', '2')!.id).toBe('live-2')
    expect(pickLive(null, 'live-3')!.id).toBe('live-3')
    expect(pickLive('live-1', 'off')).toBeNull()
  })
})

describe('live: cenas', () => {
  it('a cena vale até a próxima', () => {
    const l = LIVES[2]!
    expect(sceneAt(l, 0).index).toBe(0)
    expect(sceneAt(l, 13).index).toBe(0)
    expect(sceneAt(l, 14).index).toBe(1)
    expect(sceneAt(l, 58).index).toBe(3)
  })
  it('todo slug do roteiro existe no catálogo e as cenas estão em ordem', () => {
    for (const l of LIVES) {
      expect(l.scenes[0]!.at).toBe(0)
      l.scenes.forEach((s, i) => { if (i) expect(s.at).toBeGreaterThan(l.scenes[i - 1]!.at); s.slugs.forEach((slug) => expect(getSummary(slug), slug).toBeTruthy()) })
    }
  })
})
