import { describe, it, expect } from 'vitest'
import { canTransition } from '../../src/utils/taskRules'

// Fonte da verdade: docs/especificacao.md — RN01 (transição de status de tarefa).
// Resultados esperados derivados da especificação, não do código-fonte.
describe('canTransition (RN01)', () => {
  describe('transições permitidas', () => {
    it.each([
      ['PENDING', 'IN_PROGRESS'],
      ['IN_PROGRESS', 'COMPLETED'],
      ['IN_PROGRESS', 'CANCELLED']
    ])('permite %s -> %s', (from, to) => {
      expect(canTransition(from as any, to as any)).toBe(true)
    })
  })

  // DEFEITO #1: a especificação (RN01) permite PENDING -> CANCELLED, mas o código retorna false.
  // Teste correto segundo a especificação; não pode ser alterado para passar -> it.fails.
  it.fails('permite PENDING -> CANCELLED (cancelar antes de iniciar)', () => {
    expect(canTransition('PENDING' as any, 'CANCELLED' as any)).toBe(true)
  })

  describe('transições proibidas (não listadas na tabela)', () => {
    it.each([
      ['PENDING', 'COMPLETED'],
      ['IN_PROGRESS', 'PENDING']
    ])('impede %s -> %s', (from, to) => {
      expect(canTransition(from as any, to as any)).toBe(false)
    })

    it.each(['PENDING', 'IN_PROGRESS', 'CANCELLED'])(
      'impede COMPLETED -> %s (status final)',
      (to) => {
        expect(canTransition('COMPLETED' as any, to as any)).toBe(false)
      }
    )

    it.each(['PENDING', 'IN_PROGRESS', 'COMPLETED'])(
      'impede CANCELLED -> %s (status final)',
      (to) => {
        expect(canTransition('CANCELLED' as any, to as any)).toBe(false)
      }
    )
  })

  describe('manter o mesmo status não é transição', () => {
    it.each(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])(
      'retorna false ao manter o status %s',
      (status) => {
        expect(canTransition(status as any, status as any)).toBe(false)
      }
    )
  })

  describe('entradas inválidas (valor fora do conjunto de status)', () => {
    it('retorna false quando o status de origem é desconhecido', () => {
      expect(canTransition('ARCHIVED' as any, 'COMPLETED' as any)).toBe(false)
    })

    it('retorna false quando o status de destino é desconhecido', () => {
      expect(canTransition('PENDING' as any, 'ARCHIVED' as any)).toBe(false)
    })

    it('é sensível a maiúsculas: "pending" não é um status válido', () => {
      expect(canTransition('pending' as any, 'in_progress' as any)).toBe(false)
    })
  })
})
