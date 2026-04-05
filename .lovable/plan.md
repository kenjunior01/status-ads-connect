
Objetivo: corrigir definitivamente o registo/autenticação e depois continuar as sugestões do PDF sobre uma base real, sem dados falsos nem fluxos quebrados.

Diagnóstico confirmado
- O problema do registo parece vir de 4 pontos combinados:
  1. corrida de inicialização da autenticação: vários hooks consultam dados antes da sessão estar pronta;
  2. pipeline de criação de utilizador inconsistente no backend: existem funções como `handle_new_user`, `auto_create_wallet` e `sync_creator_listing`, mas o snapshot atual indica triggers ausentes;
  3. recuperação de senha está incompleta: o reset aponta para `/` e não existe ecrã público real para redefinir a senha;
  4. ainda há dependência de dados seed/falsos: `creator_listings` está a devolver registos com `profile_id = null`, o que pode gerar campanhas/favoritos para criadores que não existem de verdade.

Plano de implementação

1. Estabilizar a autenticação
- Criar um `useAuthReady`/estado central de auth para restaurar a sessão antes de qualquer query.
- Atualizar `Auth.tsx`, `Navigation.tsx`, `BottomNavigation.tsx` e hooks de dados para só consultar quando `isReady === true`.
- Padronizar a redireção por role sem depender de corrida entre `getSession()` e `rpc('get_user_role')`.

2. Reparar o pipeline de registo no backend
- Criar uma migration para:
  - recriar/garantir o trigger `on_auth_user_created`;
  - garantir os triggers de carteira, CPV e sync de listings;
  - fazer backfill dos utilizadores já criados sem `profiles`, `user_roles`, `creator_wallets` e listings reais.
- Manter roles apenas na tabela `user_roles`, com atribuição via metadata do signup.

3. Corrigir o fluxo de recuperação de senha
- Alterar o redirect atual para `/reset-password`.
- Adicionar uma página pública real de redefinição com `updateUser({ password })`.
- Adicionar deteção do link de recovery no arranque da app para abrir o ecrã correto quando o utilizador vem do email.

4. Limpar dependências de dados falsos
- Ajustar `useProfiles`, landing, favoritos e criação de campanhas para usar apenas listings reais (`profile_id` válido).
- Remover ou ocultar seeds sem ligação a utilizadores reais.
- Substituir claims rígidas como “100%” e “24h” por texto neutro ou métricas reais.
- Rever `CreateCampaignForm` para impedir seleção de criadores fantasma.

5. Continuar as sugestões do PDF que já estão parcialmente prontas
- Integrar `SwipeCampaignCards` nas vistas mobile relevantes.
- Tornar a `AcademiaStatusAds` acessível na navegação e nos dashboards, com progresso persistido.
- Levar a verificação por IA para mais perto do upload, com feedback imediato ao criador.
- Acrescentar a jornada “Primeiro ganho / primeiro resultado” por role:
  - criador: completar perfil → publicar prova → primeiro saque;
  - anunciante: criar primeira campanha → selecionar criador → acompanhar verificação.

6. Refinar a experiência especial por tipo de utilizador
- Criador: foco em monetização rápida, onboarding de perfil e academia prática.
- Anunciante: primeiro acesso orientado para criar campanha e usar matching/ROI.
- Depois do signup, cada role deve cair num “first action” específico em vez de só entrar num dashboard genérico.

Ficheiros mais prováveis
- Frontend: `src/pages/Auth.tsx`, `src/App.tsx`, `src/components/AuthForms.tsx`, `src/components/Navigation.tsx`, `src/components/BottomNavigation.tsx`, `src/hooks/useProfile.ts`, `src/hooks/useCampaigns.ts`, `src/hooks/useWallet.ts`, `src/hooks/useConversations.ts`, `src/hooks/useCampaignProofs.ts`, `src/hooks/useFavorites.ts`, `src/hooks/useProfiles.ts`, `src/components/CreateCampaignForm.tsx`, `src/components/ProofUploadForm.tsx`, `src/components/ProofReviewPanel.tsx`, `src/components/SwipeCampaignCards.tsx`, `src/components/AcademiaStatusAds.tsx`, `src/components/TrustStatsBar.tsx`, `src/components/ValuePropositionSection.tsx`.
- Backend: nova migration para triggers, backfill e limpeza dos listings/demo.

Critérios de validação
- Registar como criador e anunciante cria conta, perfil, role e carteira sem falhas.
- Login redireciona sempre para o dashboard correto.
- Recuperação de senha funciona ponta a ponta via link de email.
- Nenhuma query autenticada corre antes da sessão estar pronta.
- Landing, favoritos e criação de campanha usam apenas criadores reais.
- Swipe funciona no mobile, Academia fica acessível e a validação por IA aparece no fluxo real de provas.

Ordem recomendada
1. auth + triggers + reset password
2. limpeza de dados falsos e listings reais
3. integração das sugestões do PDF sobre a base já estável
