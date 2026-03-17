# AdShield Acessível

Protótipo em HTML, CSS e JavaScript para um site de bloqueio de anúncios indesejados, inspirado no fluxo visual dos arquivos `pg01.png` e `pg02.png`.

## Páginas

- `index.html`: painel principal com contador de anúncios bloqueados.
- `settings.html`: preferências de ambiente, filtros de bloqueio e contato.

## Recursos de acessibilidade e IHC

- HTML semântico (`header`, `nav`, `main`, `section`, `article`, `footer`)
- link de salto para o conteúdo principal
- foco visível e navegação por teclado
- regiões `aria-live` para feedback de estado
- mensagens de erro associadas aos campos
- contraste reforçado e modo de alto contraste
- preferência por componentes nativos do HTML
- persistência local das configurações (`localStorage`)
- suporte a responsividade e ampliação tipográfica
- atalhos de teclado:
  - `Alt + 1`: painel principal
  - `Alt + 2`: configurações
  - `Alt + B`: simular bloqueio
  - `Alt + R`: reiniciar contador

## Como executar

Abra `index.html` em um navegador moderno. Para persistência local, não é necessário servidor.
