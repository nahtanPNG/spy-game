# 🕵️ Jogo do Espião

Um jogo multiplayer onde um jogador é o espião e deve descobrir o local secreto através de perguntas estratégicas, enquanto os outros jogadores tentam identificar quem é o espião. 

**🏠 Jogo Presencial**: Este sistema foi projetado especificamente para reuniões presenciais, servindo apenas como uma ferramenta digital para distribuição e visualização das cartas. A interação, perguntas e discussões acontecem pessoalmente entre os jogadores.

## 🎯 Como Funciona

### Para os Jogadores Normais
- Recebem uma carta com um **local específico**
- Fazem perguntas para descobrir quem é o espião
- Devem dar respostas que demonstrem conhecimento do local sem serem óbvios demais

### Para o Espião
- Recebe uma carta indicando que é o **ESPIÃO**
- Não sabe qual é o local
- Deve descobrir o local através das perguntas e respostas dos outros jogadores
- Tenta se passar por um jogador normal

## 🚀 Funcionalidades

- **Sistema de Salas**: Jogadores entram usando códigos únicos de sala
- **Distribuição Digital de Cartas**: Cada jogador visualiza sua carta no próprio dispositivo
- **Conexão em Tempo Real**: WebSocket para sincronização da distribuição das cartas
- **Locais Aleatórios**: Sistema de geração aleatória de locais para cada partida
- **Interface Responsiva**: Funciona em desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **WebSocket** - Comunicação em tempo real
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Socket.io** - Gerenciamento de WebSocket

## 📋 Pré-requisitos

- Node.js 18.0 ou superior
- npm ou yarn
- Navegador moderno com suporte a WebSocket

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/spy-game.git
cd spy-game
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse `http://localhost:3000` no seu navegador
   
6. Configure o [Backend](https://github.com/nahtanPNG/spy-game-backend)

## 🎮 Como Jogar

1. **Criar/Entrar em uma Sala**
   - Um jogador cria uma sala e compartilha o código
   - Outros jogadores entram usando o código da sala

2. **Visualizar a Carta**
   - Cada jogador clica no botão "Ver Carta" no seu dispositivo
   - A carta mostra o local OU indica que você é o espião
   - **Mantenha sua carta em segredo!**

3. **Rodada de Perguntas (Presencial)**
   - Jogadores fazem perguntas estratégicas **verbalmente**
   - Respostas devem ser dadas **oralmente** sem revelar muito
   - Use o aplicativo apenas para consultar sua carta quando necessário

4. **Descobrir o Espião (Presencial)**
   - Após as perguntas, jogadores **discutem pessoalmente** e votam
   - O espião vence se descobrir o local correto
   - Todas as discussões e votações acontecem na mesa, não no app

## 🌟 Funcionalidades Planejadas

- [ ] Sistema de pontuação local
- [ ] Timer para rodadas
- [ ] Histórico de partidas
- [ ] Diferentes pacotes de locais
- [ ] Modo de configuração personalizada
- [ ] Tela de administrador da sala

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Locais Disponíveis

O jogo inclui uma variedade de locais interessantes:
- Aeroporto
- Banco
- Praia
- Escola
- Hospital
- Biblioteca
- Restaurante
- Cinema
- Parque
- Shopping
- E muito mais...

## 🐛 Reportar Bugs

Se você encontrar algum bug, por favor abra uma [issue](https://github.com/seu-usuario/spy-game/issues) descrevendo:
- O que aconteceu
- O que você esperava que acontecesse
- Passos para reproduzir o bug
- Screenshots (se aplicável)

---

**Feito com ❤️ by [nahtanPNG](https://github.com/nahtanPNG)**

*Give this project a ⭐ if you found it helpful!*