# Relatório — Testes unitários com IA generativa

**Aluno(s):** Gustavo
**Ferramenta de IA utilizada:** Claude
**Unidade testada:** `backend/src/utils/taskRules.ts` — RN01 (`canTransition`) e `backend/src/utils/normalize.ts` — RN03 (`normalizeName`)

## 1. Tabela de casos (elaborada antes de usar a IA)

Derivada exclusivamente de `docs/especificacao.md`.

### RN01 — `canTransition(from, to)`

| # | Entrada | Resultado esperado | Técnica | Regra |
|---|---------|--------------------|---------|-------|
| 1 | PENDING → IN_PROGRESS | true | partição (permitida) | RN01 |
| 2 | PENDING → CANCELLED | true | partição (permitida) | RN01 |
| 3 | IN_PROGRESS → COMPLETED | true | partição (permitida) | RN01 |
| 4 | IN_PROGRESS → CANCELLED | true | partição (permitida) | RN01 |
| 5 | PENDING → COMPLETED | false | partição (proibida) | RN01 |
| 6 | IN_PROGRESS → PENDING | false | partição (retrocesso) | RN01 |
| 7–9 | COMPLETED → PENDING / IN_PROGRESS / CANCELLED | false | status final | RN01 |
| 10–12 | CANCELLED → PENDING / IN_PROGRESS / COMPLETED | false | status final | RN01 |
| 13–16 | X → X (mesmo status, 4 status) | false | valor-limite | RN01 |
| 17 | origem desconhecida ("ARCHIVED") → COMPLETED | false | inválido | RN01 |
| 18 | PENDING → destino desconhecido | false | inválido | RN01 |
| 19 | "pending" → "in_progress" (minúsculas) | false | inválido | RN01 |

### RN03 — `normalizeName(name)`

| # | Entrada | Resultado esperado | Técnica | Regra |
|---|---------|--------------------|---------|-------|
| 1 | `"  Trabalho   da  Faculdade "` | `"trabalho da faculdade"` | exemplo da spec | RN03 |
| 2 | `"   Casa"` | `"casa"` | partição (trim início) | RN03.1 |
| 3 | `"Casa   "` | `"casa"` | partição (trim fim) | RN03.1 |
| 4 | `"a     b"` | `"a b"` | partição (colapso) | RN03.2 |
| 5 | `"a\tb"` | `"a b"` | partição (tabulação) | RN03.2 |
| 6 | `"a\nb"` | `"a b"` | partição (quebra de linha) | RN03.2 |
| 7 | `"a \t\n b"` | `"a b"` | partição (mistura) | RN03.2 |
| 8 | `"\t\nCasa\n\t"` | `"casa"` | trim de tab/quebra | RN03.1 |
| 9 | `"TRABALHO"` | `"trabalho"` | partição (caixa) | RN03.3 |
| 10 | `"ÁGUA Útil"` | `"água útil"` | partição (acentos) | RN03.3 |
| 11 | `"trabalho da faculdade"` | inalterado | partição (já normalizado) | RN03 |
| 12 | `"a b"` | `"a b"` | valor-limite (1 espaço) | RN03.2 |
| 13 | `""` | `""` | valor-limite (vazio) | RN03 |
| 14 | `" \t\n "` | `""` | inválido (só espaços) | RN03 |
| 15 | `"  Projeto  2026 - FASE 1 "` | `"projeto 2026 - fase 1"` | partição (dígitos/pontuação) | RN03 |
| 16 | dois nomes só diferentes em espaços/caixa | normalizados iguais (duplicados) | partição | RN03 |
| 17 | `"Casa"` vs `"Trabalho"` | normalizados diferentes | partição | RN03 |

## 2. Prompt utilizado

```
Siga o AGENTS.md. Escreva testes unitários em Vitest para:
- RN01 — canTransition (backend/src/utils/taskRules.ts)
- RN03 — normalizeName (backend/src/utils/normalize.ts)

Use APENAS a tabela de casos abaixo e docs/especificacao.md como oráculo.
NÃO leia a implementação para decidir resultados esperados e NÃO altere src/.
Crie backend/tests/unit/taskRules.test.ts e backend/tests/unit/normalize.test.ts,
com it.each, estrutura AAA, nomes em português e asserções específicas.
Se algum teste que segue a especificação falhar, NÃO o ajuste: marque com it.fails
e relate a divergência.
Ao final, execute os testes e liste: testes criados (ligados à regra), falhas e divergências.

[colar aqui a tabela de casos da seção 1]
```

## 3. Revisão do teste gerado

| Problema encontrado no teste gerado | Ajuste solicitado ou realizado |
|-------------------------------------|--------------------------------|
| Caso PENDING → CANCELLED dentro do `it.each` de permitidas fazia a suíte inteira ficar vermelha (falha esperada misturada aos demais casos) | Separado em teste próprio, marcado com `it.fails`, com comentário apontando o defeito #1 |
| `it.each` com array de 1 elemento e título `'%s -> %s'` gerava nomes ruins ("PENDING -> undefined") | Título alterado para `'retorna false ao manter o status %s'` |
| Uso de `as any` para passar status inválidos | Aceito: necessário para testar entradas fora do tipo `Status`; restrito aos casos de entrada inválida e ao `it.each` |
| Verificar se havia asserções fracas (`toBeTruthy`/`toBeDefined`) ou `.skip`/`.only` | Nenhuma encontrada; todas usam `toBe` |

## 4. Resultados

- Testes criados: 36 | aprovados: 35 | reprovados: 1 (defeito #1, marcado `it.fails`; suíte reporta "1 expected fail")
- Cobertura de linhas da unidade: 100 % (`taskRules.ts`, `normalize.ts`); statements, branches e funções também 100 %
- Score de mutação (backend, `src/utils`): **87,23 %** geral — `normalize.ts` 100 %, `categoryRules.ts` 100 %, `taskRules.ts` 83,78 % (31 mortos, 6 sobreviventes)

Mutantes sobreviventes (todos em `taskRules.ts:5`, `if (from === 'COMPLETED' || from === 'CANCELLED') return false`):
são **mutantes equivalentes**. Essa linha é redundante: sem ela, as linhas 6–8 já retornam `false` para origem COMPLETED/CANCELLED. Nenhum teste consegue distingui-los, então não foi criado caso novo. Descontando os equivalentes, o score efetivo é 100 %.

## 5. Defeitos encontrados (divergências entre especificação e código)

| Regra | Comportamento especificado | Comportamento observado | Teste que evidencia |
|-------|----------------------------|-------------------------|---------------------|
| RN01 | `PENDING → CANCELLED` é permitido (retorna `true`); pendente pode ser cancelada antes de iniciar | `canTransition('PENDING', 'CANCELLED')` retorna `false` (o código só aceita `PENDING → IN_PROGRESS` saindo de PENDING) | `permite PENDING -> CANCELLED (cancelar antes de iniciar)` em `taskRules.test.ts` (`it.fails`) |
