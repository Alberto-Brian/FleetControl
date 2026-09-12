// ========================================
// FILE: src/scripts/round-image.js
// ========================================
// Ferramenta reutilizável: recorta uma imagem num círculo (transparente
// fora dele), tipo os ícones redondos por omissão do Electron/macOS. Usa
// Jimp (já presente via electron-icon-builder, sem dependência nova).
//
// Uso:
//   node src/scripts/round-image.js <input.png> [output.png] [--inset=0.06]
//
// <input.png>   Caminho da imagem de origem (qualquer formato que o Jimp
//               leia — PNG/JPG/etc.; a saída é sempre PNG, para suportar
//               transparência).
// [output.png]  Caminho de saída. Por omissão: "<input>-round.png" ao
//               lado do ficheiro de origem.
// --inset=N     Encolhe o círculo N% (0 a 0.4) para deixar uma margem
//               transparente à volta — útil se o desenho já tiver a sua
//               própria moldura e não deve ficar rente ao bordo. Omitido
//               = círculo a tocar os 4 lados (maior círculo possível).
//
// Exemplo real deste projecto:
//   node src/scripts/round-image.js images/fleeticon.png images/fleeticon-round.png

const path = require('path');
const Jimp = require('jimp');

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter(a => !a.startsWith('--'));
  const insetArg = args.find(a => a.startsWith('--inset='));
  const inset = insetArg ? Number(insetArg.split('=')[1]) : 0;

  const input = positional[0];
  if (!input) {
    console.error('Uso: node src/scripts/round-image.js <input.png> [output.png] [--inset=0.06]');
    process.exit(1);
  }
  if (Number.isNaN(inset) || inset < 0 || inset >= 0.5) {
    console.error('--inset tem de ser um número entre 0 e 0.5 (ex.: 0.06 = 6%).');
    process.exit(1);
  }

  const parsed  = path.parse(input);
  const output  = positional[1] || path.join(parsed.dir, `${parsed.name}-round.png`);

  const image = await Jimp.read(input);
  const size  = Math.min(image.bitmap.width, image.bitmap.height);

  // Jimp.circle() por omissão inscreve o círculo no menor lado, centrado —
  // exactamente o que precisamos. O "inset" reduz esse raio manualmente,
  // deixando margem transparente à volta em vez de tocar os 4 lados.
  const radius = Math.floor((size / 2) * (1 - inset));
  image.circle({ radius, x: image.bitmap.width / 2, y: image.bitmap.height / 2 });

  await image.writeAsync(output);
  console.log(`Imagem arredondada: ${output} (${image.bitmap.width}x${image.bitmap.height}, raio ${radius}px)`);
}

main().catch(err => {
  console.error('Falhou:', err.message);
  process.exit(1);
});
