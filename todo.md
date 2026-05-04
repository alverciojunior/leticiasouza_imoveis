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

## Próximas Tarefas
- [x] Testar criação de imóvel com coordenadas personalizadas
- [x] Testar edição de imóvel com atualização de coordenadas
- [x] Verificar se o mapa usa corretamente as coordenadas do banco
- [x] (Opcional) Integrar seletor de mapa interativo no admin
- [x] Corrigir e validar o clique no mapa para atualizar latitude/longitude
- [x] Garantir sincronização entre edição manual e marcador do mapa
- [ ] (Opcional) Validar coordenadas no backend
- [ ] (Opcional) Adicionar geocodificação automática por endereço

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
