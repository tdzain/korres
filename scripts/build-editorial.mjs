// Copia/converte imagens editoriais para public/editorial. Origens documentadas em docs/ASSETS.md.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
const P = 'public/products'
const B = process.argv[2] // pasta com os banners baixados da loja atual
const jobs = [
  ['hero-black-pine', `${P}/black-pine-primus-youth-renewal-sleeping-facial/3.webp`],
  ['hero-smart-yoghurt', `${B}/smart-yoghurt-11093650.png`],
  ['hero-fragrancias', `${P}/deo-colonia-unissex-kyma/4.webp`],
  ['col-smart-yoghurt', `${P}/smart-yoghurt-probiotic-super-serum/3.webp`],
  ['col-olive', `${P}/pure-greek-olive-3-in-1-nourishing-oil-face-body-hair/3.webp`],
  ['col-fragrancias', `${P}/deo-colonia-masculino-blue-sage/4.webp`],
  ['story-statue', `${P}/barber-s-face-beard-cleanser/2.webp`],
  ['cat-oleo', `${B}/1-esquerda-11086530.png`],
  ['cat-sabonete', `${B}/1-meio-11087170.png`],
  ['cat-locao', `${B}/2-direita-11083870.png`],
  ['cat-maos', `${B}/2-meio-12085090.png`],
  ['cat-rosto', `${P}/apothecary-wild-rose-spotless-serum/3.webp`],
  ['cat-fragrancias', `${P}/deo-colonia-feminino-cashmere-kumquat/3.webp`],
  ['ethics', `${P}/santorini-grape-volcanic-skinreset-mask/3.webp`],
]
await mkdir('public/editorial', { recursive: true })
for (const [name, src] of jobs) {
  let img = sharp(src)
  // Recorta a faixa de ícones do infográfico na borda direita.
  if (name === 'col-smart-yoghurt') img = img.extract({ left: 0, top: 0, width: 800, height: 1000 })
  const buf = await img.toBuffer()
  await sharp(buf).resize({ width: 1100, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/editorial/${name}.webp`)
  await sharp(buf).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public/editorial/${name}-640.webp`)
  console.log('ok', name)
}
