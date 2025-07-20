# DEATHSPACE

## Sobre o Jogo

DEATHSPACE é um jogo de estratégia multijogador massivo de longo prazo onde jogadores controlam naves espaciais em um ambiente competitivo. O jogo se destaca pela importância da diplomacia e informação, onde saber em quem confiar e quando confiar são elementos cruciais para a vitória.

## Mecânicas Principais

### Início do Jogo
- Jogadores começam em posições aleatórias
- Cada nave espacial inicia com:
  - 3 Pontos de Vida (PV)
  - 1 Ponto de Ação (PA)
  - 2 de Alcance para ações

### Recursos
- Jogadores recebem 1 Ponto de Ação (PA) a cada 24 horas (Mecânica a ser implementada)
- PAs podem ser acumulados

### Ações Disponíveis

| Ação      | Descrição                                       | Custo |
|-----------|-------------------------------------------------|-------|
| MOVER     | Move a nave para uma casa dentro do alcance     | 1 PA  |
| ATACAR    | Atira em um alvo no alcance, causando 1 de dano | 1 PA  |
| DOAR      | Transfere 1 PA para outro jogador no alcance    | 1 PA  |
| RECUPERAR | Recupera 1 PV (máximo de 3 PV)                  | 3 PA  |
| APRIMORAR | Aumenta o alcance em 1 permanentemente          | 3 PA  |

### Sistema de Morte
- Jogador morre ao ter seus PVs zerados.
- Ao morrer:
  - Seus PAs são transferidos para quem o eliminou.
  - Sua nave se torna um destroço no mapa.
  - O jogador se torna membro do Conselho.

### Conselho
- Composto por jogadores eliminados.
- Realiza votação diária. Jogadores vivos com 3+ votos recebem 1 PA extra.
- O primeiro jogador a ser eliminado tem voto com peso 3. Os demais têm peso 1.

### Condições de Vitória
- O jogo termina quando restam 4 jogadores.
- As posições (1º, 2º e 3º) são definidas por consenso entre os finalistas.
- Se não houver consenso, inicia-se a fase de Morte Súbita e os PAs recebidos são dobrados.

## Versão
v0.1.0-alpha.2

---

*"As maiores armas são diplomacia e informação. Saber em quem (e quando) confiar são as chaves para a vitória."*