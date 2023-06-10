# @transmute/jose-hpke

[![CI](https://github.com/transmute-industries/jose-hpke/actions/workflows/ci.yml/badge.svg)](https://github.com/transmute-industries/jose-hpke/actions/workflows/ci.yml)

[![NPM](https://nodei.co/npm/@transmute/jose-hpke.png?mini=true)](https://npmjs.org/package/@transmute/jose-hpke)

<img src="./transmute-banner.png" />

#### [Questions? Contact Transmute](https://transmute.typeform.com/to/RshfIw?typeform-source=jose-hpke) | <a href="https://platform.transmute.industries">Transmute VDP</a> | <a href="https://guide.transmute.industries/verifiable-data-platform/">Our Guide</a> | <a href="https://transmute.industries">About Transmute</a>

#### 🚧 Warning Experimental 🔥

This project uses unregistered JOSE `alg` values.

See this table as proposal for future interoperabilty:

### Algorithms

- [IANA Assignments for JOSE](https://www.iana.org/assignments/jose)

- [IANA Assignments for HPKE](https://www.iana.org/assignments/hpke)

The following table is used to restrict JSON Web Keys.

| jose    | cose | mode | kem    | kdf    | aead   |
| ------- | ---- | ---- | ------ | ------ | ------ |
| HPKE-B0 | 1024 | base | 0x0010 | 0x0001 | 0x0001 |
| HPKE-B1 | ...  | base | 0x0011 | 0x0002 | 0x0002 |


```json
{
  "kty": "EC",
  "crv": "P-256",
  "alg": "HPKE-B0",
  "x": "RGuElrDRaOTXHgOEv4ezdSTQaop_Lbb1doFBjcpRFOw",
  "y": "MAa3Kzj9XcF93vMCtUirjwggStYcXXmaCkYLCzZ4st4"
}
```