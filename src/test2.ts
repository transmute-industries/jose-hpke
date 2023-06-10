import hpke from './hpke'

(async ()=>{
  const k = await hpke.generate(hpke.TBD_0)
  const pt = 'hello world'
  const m = new TextEncoder().encode(pt)
  const c = await hpke.encrypt(m, k.publicKeyJwk)
  const d = await hpke.decrypt(c, k.privateKeyJwk)
  const rpt = new TextDecoder().decode(d)
  console.log(rpt === pt)
})()