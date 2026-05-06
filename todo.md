# Real Estate Broker - TODO

## Features Implementadas
- [x] Homepage com listagem de imóveis
- [x] Página de detalhes do imóvel com galeria de fotos
- [x] Botão WhatsApp flutuante
- [x] Formulário de contato
- [x] Painel administrativo com CRUD de imóveis
- [x] Upload de imagens com drag-and-drop
- [x] Dashboard de estatísticas
- [x] Filtros avançados na homepage
- [x] Google Maps com raio de 5km
- [x] Migração para banco de dados MySQL
- [x] Campos de latitude e longitude no formulário de admin

## Tarefas Opcionais (Não Implementadas)
- [x] Validar coordenadas no backend (intervalo válido)
- [x] Adicionar geocodificação automática por endereço

## Bugs Corrigidos
- [x] Google Maps não carregava corretamente
- [x] Erro de coordenadas inválidas no mapa
- [x] Mapeamento de imagens do banco de dados
- [x] Upload de imagens para S3
- [x] Alterar título da guia do navegador para "Leticia Souza - Imóveis"
- [x] Alterar email para leticia.frodrigues.souza@gmail.com
- [x] Alterar nome da guia para "Letícia Souza - Soluções Imobiliárias"
- [x] Remover "Contato Rápido" do rodapé

## Autenticação Admin (Nova)
- [x] Criar tabela de usuários admin no banco de dados
- [x] Implementar página de login com email e senha
- [x] Criar dois usuários iniciais (leticia e alvercio)
- [x] Implementar mecanismo de troca de senha
- [x] Implementar mecanismo para criar novos usuários admin
- [x] Proteger rota /admin com autenticação
- [x] Testar fluxo de login e logout

## Publicação (Nova)
- [x] Alterar título da guia para "Letícia Souza - Soluções Imobiliárias"
- [x] Adicionar logo como favicon
- [x] Publicar com domínio leticiasouzaimoveis.com (nome e ícone atualizados com sucesso)

## Correções (Nova)
- [x] Permitir 0 quartos e banheiros para terrenos

## Bugs Corrigidos (Continuação)
- [x] Erro de string vazia no atributo src (imóveis sem imagens)

## Novas Tarefas
- [x] Adicionar campo "Tipo" no formulário de admin (Apartamentos, Casas, Comerciais, Galpões, Rurais, Terrenos)
- [x] Adicionar filtro "Tipo" na página do cliente que só mostra opções com imóveis cadastrados
- [x] Melhorar filtros de quartos e banheiros para só mostrar opções disponíveis
- [x] Atualizar banco de dados com coluna "type"
- [x] Criar testes para validação de tipo de imóvel

## Ordenação de Resultados
- [x] Adicionar campo de ordenação no componente PropertyFilters
- [x] Implementar lógica de ordenação por preço (menor/maior) e data
- [x] Persistir ordenação na URL
- [x] Criar testes para validação de ordenação


## Bugs em Correção
- [x] Upload de imagem real causa crash (imagem fictícia funciona) - Sanitizado nomes de arquivo removendo espaços

## Marca D'água (Re-implementação)
- [x] Adicionar marca d'água com Sharp após upload bem-sucedido
- [x] Testar marca d'água com imagens reais
- [x] Validar que marca d'água não quebra o carregamento
- [x] Implementar tratamento de erro explícito (falha se logo não existir)
- [x] Adicionar testes de integração do fluxo completo de upload
- [x] Validar que imagens watermarked mantêm qualidade JPEG

## Bugs em Correção (Marca d'Água)
- [x] Remover tarjas pretas acima e abaixo do logo na marca d'água

## Novas Funcionalidades (Admin)
- [x] Adicionar botão para remover todas as imagens de um anúncio
- [x] Implementar procedure no backend para remover todas as imagens
- [x] Adicionar confirmação de exclusão
- [x] Testar funcionalidade no Admin Dashboard
- [x] Proteger deleteAllImages com adminProcedure
- [x] Adicionar testes automatizados para deleteAllImages

## Bugs em Correção (Upload Múltiplo)
- [x] Corrigir upload múltiplo de imagens (apenas 1 é enviada de 7)

## Novas Funcionalidades (Página Pública)
- [x] Adicionar botão "Vendido" para marcar anúncio como inativo
- [x] Desabilitar clique em propriedades marcadas como vendidas
- [x] Adicionar campo `sold` na tabela de propriedades
- [x] Implementar modal de maximização de imagem ao clicar
- [x] Adicionar botão "Remover todas as fotos" na prévia do imóvel (admin)
- [x] Remover botão "Remover Fotos" da seção de edição


## 🚨 BUG CRÍTICO (Produção - Dados Reais)
- [x] URGENTE: Imagens sendo enviadas para múltiplos anúncios simultaneamente
  - Causa: Backend não retornava ID da propriedade criada, frontend pegava primeira da lista
  - Solução: Backend agora retorna ID, frontend usa esse ID para upload
  - Status: CORRIGIDO

## Melhorias Solicitadas (Sessão Atual)
- [x] Implementar drag-and-drop para reorganizar imagens no AdminDashboard sem fechar edição
  - Criado componente DraggableImageGrid com suporte a drag-and-drop
  - Integrado em AdminDashboard com mutation para reordenar
  - Botões de navegação não disparam reordenação
  - CORRIGIDO: Mudado de verticalListSortingStrategy para rectSortingStrategy para grids
  - CORRIGIDO: Adicionado useEffect para sincronizar estado com props
- [x] Corrigir UX da galeria: apenas nome/centro abre anúncio, não a imagem inteira
  - Refatorado cards featured para remover link envolvendo toda a imagem
  - Refatorado cards regulares para remover link envolvendo toda a imagem
  - Apenas título agora abre o anúncio
  - Adicionado stopPropagation nos controles de ImageCarousel
- [x] Limpar anúncios de teste da base de desenvolvimento
  - Criado script cleanup-test-data.mjs para remover propriedades de teste
  - Removidos dados hardcoded de PropertyDetail.tsx
  - Agora carrega dados apenas do backend via tRPC

## Melhorias Adicionais (Sessão Atual)
- [x] Aumentar limite de upload de fotos de 10 para 20
  - Atualizado maxImages em AdminDashboard de 10 para 20
  - Atualizado padrão em ImageUpload de 10 para 20
  - Adicionada validação server-side no uploadImage para bloquear >20 imagens
  - Adicionado cálculo de limite restante no frontend (20 - imagens existentes)
  - Adicionada mensagem de aviso quando limite é atingido
  - Criados 3 testes automatizados para validar limite
  - Todos os 63 testes passando
