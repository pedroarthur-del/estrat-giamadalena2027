# Planejamento Estratégico · Colégio Santa Madalena Sofia

Mesma arquitetura da plataforma Visions, com identidade do msofia.com e dados do Madalena Sofia.

## Arquitetura (resumo)

| Camada | O que faz |
|---|---|
| Utilidades | datas, formatação (%, R$, h, colocação) |
| Schemas | validação por entidade (objetivo, KR, projeto, atividade) |
| Adaptadores de armazenamento | `FirebaseStore` (nuvem), `DbStore` (artifact do Claude), `LocalStore` (navegador) |
| Repositórios | CRUD + integridade (não exclui objetivo com KRs/projetos, projeto com atividades) |
| Serviço de indicadores | execução, atrasos, aderência ao cronograma, atingimento de KRs |
| RBAC | Administrador, Editor, Leitor (app + `firestore.rules`) |

Modelo de dados: **OKR → KR** e **OKR → Projeto estratégico (KR opcional) → Atividades**.

A plataforma escolhe o armazenamento sozinha:
1. Aberta como artifact no Claude → banco do artifact (já está no ar e com os dados carregados).
2. `FIREBASE_CONFIG` preenchido → Firebase com login por e-mail e papéis.
3. Nenhum dos dois → salva só no navegador.

Senha da equipe (tela de abertura): `madalena2027`. Para trocar, gere o SHA-256 da senha em MAIÚSCULAS, sem acentos e sem espaços, e substitua `PASS_HASH`.

## Publicar no GitHub Pages com Firebase (igual à Visions)

1. **Firebase**: crie um projeto novo (ex.: `planejamento-madalena-sofia`). Não reutilize o da Visions.
2. **Authentication** → ative *E-mail/senha* → crie o usuário `acesso@planejamento-madalena-sofia.app` com a senha da equipe.
3. **Firestore** → crie o banco (região `southamerica-east1`) → aba *Regras* → cole o conteúdo de `firestore.rules` → Publicar.
4. **Configurações do projeto** → *Seus apps* → app Web → copie o `firebaseConfig` e cole em `index.html` no lugar de `const FIREBASE_CONFIG=null;`.
5. **Authentication → Configurações → Domínios autorizados** → adicione `SEU-USUARIO.github.io`.
6. **GitHub** → repositório novo `planejamento-madalena-sofia` → envie `index.html` → *Settings → Pages* → branch `main`, pasta `/`.
7. Entre com a senha da equipe: o primeiro acesso como administrador carrega automaticamente os OKRs e os 20 projetos 2027.
8. Em **Configurações → Pessoas**, cadastre os líderes com e-mail e papel; cada um recebe convite para criar a própria senha.# estrat-giamadalena2027
