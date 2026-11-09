# Foto pessoal

Para colocar a foto (regra 1 do professor), adicione um arquivo chamado `photo`
nesta pasta, com uma destas extensões: `.jpg`, `.jpeg`, `.png`, `.webp` ou
`.avif`.

Requisitos (RF-03, B.4):

- Mínimo de 800×800 px, formato quadrado (1:1).
- Rosto centralizado, foto casual.
- Sem filtro pesado.

Depois de adicionar o arquivo, rode `npm run build`. Nenhum código precisa
ser editado: o componente `PhotoSlot` encontra o arquivo automaticamente. Sem
a foto, o slot mostra o monograma "KF" e `npm run check:delivery` falha de
propósito, para lembrar que a regra 1 ainda não foi cumprida.
