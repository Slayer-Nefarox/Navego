# navego

navego é um bloqueador de anúncios feito para pessoas mais idosas, que usam a internet com menos frequência e querem uma navegação mais tranquila, simples e segura.

## Sobre o projeto

Este projeto foi pensado para deixar a experiência na web mais confortável para quem prefere uma extensão fácil de usar, sem muitas opções complicadas.

O navego ajuda a:

- bloquear anúncios e rastreadores comuns;
- impedir formulários de pagamento suspeitos;
- oferecer um modo rigoroso para bloquear todos os formulários, se desejado;
- manter o popup simples, com confirmação antes de desligar a proteção.

## Quem pode usar

- pessoas mais idosas;
- usuários que acessam a internet com pouca frequência;
- quem quer uma extensão funcional, com interface intuitiva e sem complicações técnicas.

## Funcionalidades

- bloqueio de anúncios e rastreadores;
- bloqueio de formulários de pagamento;
- modo rigoroso para bloquear todos os formulários;
- popup com botão de ligar/desligar;
- confirmação antes de desativar a proteção;
- tela de configurações com opções simples.

## Como usar

1. Instale a extensão no navegador compatível com Manifest V2.
2. Abra o popup da extensão.
3. Ative ou desative a proteção com o botão principal.
4. Se quiser, abra a tela de configurações para ajustar as opções.

## Estrutura do projeto

- `background.js` — lógica em segundo plano da extensão
- `content.js` — intercepta e bloqueia conteúdo nas páginas
- `manifest.json` — configuração da extensão
- `rules.json` — regras de bloqueio
- `popup/` — interface do popup
- `options/` — configurações da extensão
- `Images/` — arquivos visuais

## Observações

O foco do projeto é tornar a navegação mais segura e menos confusa, com uma experiência pensada para quem não usa a internet todos os dias e quer algo prático.
