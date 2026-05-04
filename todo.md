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

## Marca D'agua em Imagens
- [x] Copiar logo para assets do projeto
- [x] Implementar função de adição de marca d'agua com Sharp/Pillow
- [x] Integrar marca d'agua no upload de imagens
- [x] Testar marca d'agua em diferentes tamanhos de imagem
- [x] Criar testes para validação de marca d'agua

## Bugs em Correção
- [x] Imagens não estão carregando na página de detalhes e prévia
