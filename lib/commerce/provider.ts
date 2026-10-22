import { MockProvider } from './MockProvider'
import type { CommerceProvider } from './types'

let instance: CommerceProvider | null = null

/** Troque a implementação aqui (VTEX, Shopify, Nuvemshop...) sem tocar na UI. */
export function getCommerce(): CommerceProvider {
  return (instance ??= new MockProvider())
}
