import { describe, it, expect } from 'vitest'
import { normalizeName } from '../../src/utils/normalize'

// Fonte da verdade: docs/especificacao.md — RN03 (normalização de nomes).
// Ordem: 1) trim; 2) colapsar espaços internos em um; 3) minúsculas.
describe('normalizeName (RN03)', () => {
  it('aplica o exemplo da especificação', () => {
    expect(normalizeName('  Trabalho   da  Faculdade ')).toBe('trabalho da faculdade')
  })

  it('remove espaços apenas no início', () => {
    expect(normalizeName('   Casa')).toBe('casa')
  })

  it('remove espaços apenas no fim', () => {
    expect(normalizeName('Casa   ')).toBe('casa')
  })

  it('colapsa vários espaços internos em um único espaço', () => {
    expect(normalizeName('a     b')).toBe('a b')
  })

  it('substitui tabulação interna por um único espaço', () => {
    expect(normalizeName('a\tb')).toBe('a b')
  })

  it('substitui quebra de linha interna por um único espaço', () => {
    expect(normalizeName('a\nb')).toBe('a b')
  })

  it('colapsa sequência mista de espaço, tabulação e quebra de linha em um único espaço', () => {
    expect(normalizeName('a \t\n b')).toBe('a b')
  })

  it('remove tabulação e quebra de linha nas pontas', () => {
    expect(normalizeName('\t\nCasa\n\t')).toBe('casa')
  })

  it('converte todas as letras para minúsculas', () => {
    expect(normalizeName('TRABALHO')).toBe('trabalho')
  })

  it('converte letras acentuadas para minúsculas', () => {
    expect(normalizeName('ÁGUA Útil')).toBe('água útil')
  })

  it('mantém inalterado um nome já normalizado', () => {
    expect(normalizeName('trabalho da faculdade')).toBe('trabalho da faculdade')
  })

  it('mantém um único espaço interno (valor-limite)', () => {
    expect(normalizeName('a b')).toBe('a b')
  })

  it('retorna string vazia para string vazia', () => {
    expect(normalizeName('')).toBe('')
  })

  it('retorna string vazia quando só há espaços em branco', () => {
    expect(normalizeName(' \t\n ')).toBe('')
  })

  it('preserva dígitos e pontuação', () => {
    expect(normalizeName('  Projeto  2026 - FASE 1 ')).toBe('projeto 2026 - fase 1')
  })

  it('considera duplicados nomes que diferem só em espaços e caixa', () => {
    expect(normalizeName('  Trabalho   FACULDADE')).toBe(normalizeName('trabalho faculdade '))
  })

  it('considera diferentes nomes com palavras distintas', () => {
    expect(normalizeName('Casa')).not.toBe(normalizeName('Trabalho'))
  })
})
