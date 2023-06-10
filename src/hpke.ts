import crypto from 'crypto'
import * as jose from 'jose'
import { Kem, Kdf, Aead, CipherSuite } from 'hpke-js'
// eslint-disable-next-line @typescript-eslint/no-var-requires

// tag: TBD 0
// 'HPKEv1-Base-DHKEM(P256,HKDFSHA256)-HKDFSHA256'
// https://developer.apple.com/documentation/passkit/wallet/verifying_wallet_identity_requests?language=objc
const TBD_0 = 'HPKE-B0' // aka APPLE-HPKE-v1

const suites: any = {
  [TBD_0]: new CipherSuite({
    kem: Kem.DhkemP256HkdfSha256,
    kdf: Kdf.HkdfSha256,
    aead: Aead.Aes128Gcm,
  }),
}

const algToCrv: any = {
  [TBD_0]: 'P-256',
}

const generate = async (alg: string) => {
  const { publicKey, privateKey } = await jose.generateKeyPair(
    'ECDH-ES+A128KW',
    { extractable: true, crv: algToCrv[alg] },
  )
  const publicKeyJwk = await jose.exportJWK(publicKey)
  const privateKeyJwk = await jose.exportJWK(privateKey)
  return {
    publicKeyJwk: {
      kty: publicKeyJwk.kty,
      crv: publicKeyJwk.crv,
      alg: alg,
      x: publicKeyJwk.x,
      y: publicKeyJwk.y,
      use: 'enc',
      key_ops: ['deriveBits'],
    },
    privateKeyJwk: {
      kty: privateKeyJwk.kty,
      crv: privateKeyJwk.crv,
      alg: alg,
      x: privateKeyJwk.x,
      y: privateKeyJwk.y,
      d: privateKeyJwk.d,
      key_ops: ['deriveBits'],
    },
  }
}

const crvToLength: any = {
  'P-256': 66,
}
const convertEncToJwk = (recipientPublicKeyJwk: any, enc: any) => {
  const encodedSender = Buffer.from(enc).toString('hex')
  const length = crvToLength[recipientPublicKeyJwk.crv]
  const epk = {
    kty: recipientPublicKeyJwk.kty,
    crv: recipientPublicKeyJwk.crv,
    alg: recipientPublicKeyJwk.alg,
    key_ops: ['deriveBits'],
    x: Buffer.from(encodedSender.slice(2, length), 'hex').toString('base64'),
    y: Buffer.from(encodedSender.slice(length), 'hex').toString('base64'),
  }
  return epk
}

const convertJwkToEnc = (publicKeyJwk: any) => {
  const buffer = Buffer.concat([
    Buffer.from('04', 'hex'),
    Buffer.from(publicKeyJwk.x, 'base64'),
    Buffer.from(publicKeyJwk.y, 'base64'),
  ])
  return Uint8Array.from(buffer)
}

// todo: use jwks instead...
const encrypt = async (plaintext: Uint8Array, recipientPublicKeyJwk: any) => {
  const publicKeyJwk = JSON.parse(JSON.stringify(recipientPublicKeyJwk))
  const { alg } = publicKeyJwk
  delete publicKeyJwk.alg
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    {
      name: 'ECDH',
      namedCurve: publicKeyJwk.crv,
    },
    true,
    [],
  )
  const sender = await suites[alg].createSenderContext({
    recipientPublicKey: publicKey,
  })
  // todo: generate content encryption key
  const ct = await sender.seal(plaintext)
  const epk = convertEncToJwk(recipientPublicKeyJwk, sender.enc)
  const ciphertext = jose.base64url.encode(new Uint8Array(ct))
  return {
    unprotected: { jwk: epk, enc: 'A128GCM' },
    ciphertext,
  }
}

const decrypt = async (jwe: any, recipientPrivateKeyJwk: any) => {
  const privateKeyJwk = JSON.parse(JSON.stringify(recipientPrivateKeyJwk))
  const { alg } = privateKeyJwk
  const { unprotected, ciphertext } = jwe
  // web crypto doesn't know about HPKE yet.
  delete privateKeyJwk.alg
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'ECDH',
      namedCurve: privateKeyJwk.crv,
    },
    true,
    ['deriveBits'],
  )
  const recipient = await suites[alg].createRecipientContext({
    recipientKey: privateKey, // rkp (CryptoKeyPair) is also acceptable.
    enc: convertJwkToEnc(unprotected.jwk),
  })
  const ct = jose.base64url.decode(ciphertext)
  const pt = await recipient.open(ct)
  return new Uint8Array(pt)
}

const hpke = { TBD_0, suites, generate, encrypt, decrypt }

export default hpke
