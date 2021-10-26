<template>
  <v-main>
    <v-container>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Connect Cryptid
        </v-stepper-step>

        <v-stepper-content step="1">
          <Cryptid v-if="!cryptidAccount"
                   v-bind:on-connected="onWalletConnected"
                   v-bind:on-disconnected="onWalletDisconnected"
                   :network="$config['solanaNetwork']"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Capture Private Key
          <small>temporary solution</small>
        </v-stepper-step>

        <v-stepper-content step="2">
          <Key v-bind:connection="onDidConnected" v-bind:cryptid-address="cryptidAccount"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          Civic SIP Flow
        </v-stepper-step>

        <v-stepper-content step="3">
          <Civic
            :app-id="$config['sipAppId']"
            :scope-request="$config['civicScopeRequest']"
            :on-auth-code-received="onAuthCodeRecevied"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 4" step="4">
          Exchange Token for Credentials
        </v-stepper-step>
        <v-stepper-content step="4">
          <CivicExchange
            :auth-code="civicAuthCode"
            :on-exchanged="onAuthCodeExchanged"
            :endpoint="$config['sipExchangeEndpoint']"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 5" step="5">
          Exchange Token for Credentials
        </v-stepper-step>
        <v-stepper-content step="5">
          <VPValidator :presentation="signedVp"/>
        </v-stepper-content>
      </v-stepper>
    </v-container>
  </v-main>
</template>
<script lang="ts">
import Vue from 'vue';
import { Cryptid as CryptidInterface } from '@identity.com/cryptid';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { DIDDocument } from 'did-resolver';
import Cryptid from '@/components/Cryptid.vue';
import VPValidator from '@/components/VPValidator.vue';
import Civic from '@/components/Civic.vue';
import Key from '@/components/Key.vue';
import CivicExchange from '@/components/CivicExchange.vue';
import { presentation } from '@/lib';
import { createJwkFromBs58 } from '@/lib/keyUtil';

interface ComponentData {
  step: number;
  cryptidAccount: string | undefined;
  did: {
    did: string;
    keyname: string;
    prvKey: string;
    cryptid?: CryptidInterface;
    document?: DIDDocument;
  } | undefined;
  civicAuthCode: string;
  signedVp: any | undefined;
}

export default Vue.extend({
  components: {
    Cryptid,
    Civic,
    Key,
    CivicExchange,
    VPValidator,
  },
  data(): ComponentData {
    return {
      step: 5,
      cryptidAccount: '',
      did: undefined,
      civicAuthCode: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0OThjZTE1MC05ZGU1LTQ3YjgtYmY0Yi01YzUwMjc0MmNmZmIiLCJpYXQiOjE2MzUyNDY5NDQuMTEyLCJleHAiOjE2MzUyNDg3NDQuMTEyLCJpc3MiOiJjaXZpYy1zaXAtaG9zdGVkLXNlcnZpY2UiLCJhdWQiOiJodHRwczovL2FwaS5jaXZpYy5jb20vc2lwLyIsInN1YiI6IlNrRzFFM2F0TSIsImRhdGEiOnsiY29kZVRva2VuIjoiZDFhMzI2N2ItZTc1NS00NDM0LTk5ZDctMDJmZGFmODkyNDM1In19.yFw4WQZjoc_PB6O0rl-bwJnZZGg8prPq4Yzjd-Q541GZbZa7H1Xq2j8-HPGKd1Qn4ww5MjumnbYYD32AVjHuqQ',
      signedVp: undefined,
    };
  },
  methods: {
    async onWalletConnected(wallet: WalletAdapter) {
      this.cryptidAccount = wallet.publicKey?.toBase58();
      this.did = undefined;

      console.log(`Connected to Cryptid account: ${this.cryptidAccount}`);

      this.step = 2;
    },
    onWalletDisconnected() {
      this.did = undefined;
      this.cryptidAccount = '';
      this.step = 1;
    },
    async onDidConnected(did: string, keyname: string, prvKey: string, cryptid: CryptidInterface) {
      const document = await cryptid.document();

      this.did = {
        did,
        keyname,
        prvKey,
        cryptid,
        document,
      };

      this.step = 3;
    },
    async onAuthCodeRecevied(token: string) {
      this.civicAuthCode = token;

      this.step = 4;
    },
    async onAuthCodeExchanged(data: { credentials: any }) {
      if (!this.did) {
        return;
      }

      const jwkPvt = await createJwkFromBs58(this.did.prvKey, this.did.did, this.did.keyname);

      const vp = presentation.create(data.credentials, `${this.did?.did}#${this.did?.keyname}`);

      this.signedVp = await presentation.sign(vp, jwkPvt);

      console.log(JSON.stringify(this.signedVp));

      this.step = 5;
    },
  },
  created() {
    this.did = {
      did: 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF',
      keyname: 'default',
      prvKey: '22jH4D3nP2aELBvEMFHYd16MQNACy3zSKJTNj3aM2ic8nbkT9KEYEFMcg5XXr39KNe8GMFYefVAyfvEGLniZ884u',
    };

    this.signedVp = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
      type: ['VerifiablePresentation'],
      holder: { id: 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF#default' },
      verifiableCredential: [{
        identifier: 'credential-cvc:Email-v1',
        issuanceDate: '2021-05-28T10:59:06Z',
        transient: false,
        claim: { contact: { email: { domain: { name: 'identity', tld: 'org' }, username: 'william' } } },
        id: '9dc83f2d-097d-4211-8ee0-6a54a04a18ce',
        proof: {
          merkleRoot: 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4',
          merkleRootSignature: { pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD', signature: '304402204747e81eacda23cd964d8b8b1eb9f8d2d615069aa3d5f12f2cb6e5dfba56e69602206035fc6b820bd8bdacf8e3b4c524d315cd8ded82f22c7c6786b7ed9e4a78e2d8', algo: 'ec256k1' },
          type: 'CvcMerkleProof2018',
          leaves: [{
            identifier: 'claim-cvc:Contact.email-v1', node: [{ right: '90ef29c41a5d51762f5485cbe5850a34cb69b893a065c105b4834809f969525f' }, { right: 'f3ef0545a6f61f2e3389516ed0fc667f53497556bfda96bd8517ee69b900f7ce' }, { right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a' }, { right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e' }, { right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916' }], claimPath: 'contact.email', targetHash: 'd38bf743f973b93a0391cfdc459b0d028cb5f62b59d372b3e7b61cd44f1f82be', value: 'urn:email.domain.name:f706160ab6e2a87f154963a330786f8cdfe6d45a62692b08b3c0ff7aca82f653:identity|urn:email.domain.tld:fb0fa3808b73c8830337071eed9e1ee702e78b793ed58e9796eb9bf05ef0b125:org|urn:email.username:dce53904e0af2346d1684cd5c4566055f1b4518aa58b467a010d4e1f89d1d03e:william|',
          }, {
            identifier: 'claim-cvc:Email.domain-v1', node: [{ left: 'd38bf743f973b93a0391cfdc459b0d028cb5f62b59d372b3e7b61cd44f1f82be' }, { right: 'f3ef0545a6f61f2e3389516ed0fc667f53497556bfda96bd8517ee69b900f7ce' }, { right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a' }, { right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e' }, { right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916' }], claimPath: 'contact.email.domain', targetHash: '90ef29c41a5d51762f5485cbe5850a34cb69b893a065c105b4834809f969525f', value: 'urn:domain.name:f706160ab6e2a87f154963a330786f8cdfe6d45a62692b08b3c0ff7aca82f653:identity|urn:domain.tld:fb0fa3808b73c8830337071eed9e1ee702e78b793ed58e9796eb9bf05ef0b125:org|',
          }, {
            identifier: 'cvc:Meta:issuer', node: [{ right: '234c9e609469e17d515ebded93ebefd5b8bc3704af0ae05c47139ec3a5209b78' }, { left: '2b264a81e4c465f6008bfd6a16a850f8625634cecd9be2b395c1c3a1bdb08929' }, { right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a' }, { right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e' }, { right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916' }], claimPath: 'meta.issuer', targetHash: 'd04a1a4c2b12602b0d13ebe88fad8ca129cbe7a22fa0760a5a209fd07f180078', value: 'urn:issuer:2ea9477a333eb8b0f716e8ebbd6c32f71568f65a114f163f2ab23e1a1ef577e4:did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233|',
          }, {
            identifier: 'cvc:Meta:issuanceDate', node: [{ left: 'd04a1a4c2b12602b0d13ebe88fad8ca129cbe7a22fa0760a5a209fd07f180078' }, { left: '2b264a81e4c465f6008bfd6a16a850f8625634cecd9be2b395c1c3a1bdb08929' }, { right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a' }, { right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e' }, { right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916' }], claimPath: 'meta.issuanceDate', targetHash: '234c9e609469e17d515ebded93ebefd5b8bc3704af0ae05c47139ec3a5209b78', value: 'urn:issuanceDate:e2b1ff8b47e33cdf8ab4a10086e15d001b378b35aa021ba2c5588f1d0a8291d0:2021-05-28T10:59:06.638Z|',
          }, {
            identifier: 'cvc:Meta:expirationDate', node: [{ right: 'e177beab779472cf6dfab025e13c479755ab82cb31802f8b7149f3749559d5e1' }, { right: '38b1f6578eb6d962dbb4e84ffd478c3115f08f93b334d94ca38e9df5ba04897b' }, { left: '75c2de970bdd44049152fc9066b2489f5cade89643e5065454322887c425cd1a' }, { right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e' }, { right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916' }], claimPath: 'meta.expirationDate', targetHash: 'dd2a692ca5d4c22af6b854c9f854c84cf7a30d303a428f48e5704eb0de53e666', value: 'urn:expirationDate:d5d341c83020245c776a5068f8fd833de8160a4870496ef3974095be0e03ed5b:null|',
          }],
          anchor: {
            schema: 'bch-20180201',
            deletedAt: -1,
            tx: '0100000001559519221682129cedb54e3152eed3d41219cc9d99f055e051b7dd49d1a95db100000000fdfd00004830450221009560cb6807c2a5df77f73494e0146ae92ad2a9f02b91dd91452bc250dd8966f502205406659b223aabd46afa7cd47338293944351fd34d1614fef128dd96374f68f501473044022030c659150e5bc92873be65e71334b5b86a5ee6b4b2b0970d226c8fb56cce0b53022024bacc3c9e519646aaa518437755839a7d702268de3a7034a6ee6e6ecf31a13e014c695221033753071d26a5b8e80557785b86da700990db1fbd37b995141afe2b4b3d8fc263210221adead4299d69cdb6a6ac47deabe82ae48f87ee0ea3dfd5d04c406c54041b082103420025000c9b798992dd89afcfa899018991e2b250397c37dc4903ba3a89a6d753aeffffffff01551500000000000017a9149bf61235fecd70b5489cfd25672db58d7925b1058700000000',
            subject: {
              label: 'credential-cvc:Email-v1', pub: 'xpub6Z9RGgQFgDbtMKe4eNsjBH53HQ93xpLuXwQrCr6xtCwg95xEurwGBWPr3NjpULYdx6Jncz4efDaU9Wz3TH9E3YtTkFyt44fd5KNonMNj4Nx', data: 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4', signature: '304402201d7dac4a2abc330da69a530b79525783d82377a0bc677332037e92f27ee9e3340220458e8472c6d4103a479a8dbff78d52b51c3d40880cb28ab418a080cadcc95a83',
            },
            requestId: '60b0cd012bad43005ae58efa',
            authority: { pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq', path: '/1/0/0/0' },
            _id: '60b0cd022bad43005ae58efb',
            cosigners: [{ pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq' }, { pub: 'xpub661MyMwAqRbcEiwHUuCwD1HSFoKtqdHCmFCrdJsCRH4sc8KULwFpjQgLthVQq1rdTmAFqj4v7aj7KwewMK6ceQfvTpdVSrp8Zrncc3wGmWw' }],
            type: 'temporary',
            network: 'bitcoincash',
          },
        },
        type: ['VerifiableCredential', 'IdentityCredential'],
        version: '1',
        issuer: 'did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233',
        granted: '304402203507669d68fc2e446e7b076f6e1b819ed24c54546d95582d73e4460e363f16c502205eb71f08f8d71df0a20356bdc8de987b08e395c62a1d4329a4534c201109d23f',
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.identity.com/credentials/v1'],
        credentialSubject: { id: 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF#default' },
        meta: { type: ['Credential', 'credential-cvc:Email-v1'], issuanceDate: '2021-05-28T10:59:06.638Z' },
      }, {
        identifier: 'credential-cvc:PhoneNumber-v1',
        issuanceDate: '2021-05-28T10:59:52Z',
        transient: false,
        claim: {
          contact: {
            phoneNumber: {
              country: 'ZA', number: '829283948', countryCode: '27', lineType: 'mobile',
            },
          },
        },
        id: '073a85d1-7e89-410e-9f8a-03e96d8080c9',
        proof: {
          merkleRoot: 'e5bb48bbaa2ea41b1e87f719e8f5b25dcdb16d2f8647abb376477da44e1cd959',
          merkleRootSignature: { pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD', signature: '3045022100d843452c6b551981a734387662ca77b7419d2554b1553318aca70a8302b08c3002201cb3d68c6880f6a738f7fa8f9e2686d593331a611dc14fc1e05f593839ca84c5', algo: 'ec256k1' },
          type: 'CvcMerkleProof2018',
          leaves: [{
            identifier: 'claim-cvc:Contact.phoneNumber-v1', node: [{ right: '60c8d1a05affc8066469e822733fe2b75f083f8ff3d6f03b9421c6f6ec4cd21f' }, { right: '098e94f02947f7c2aff642c47969b58a1532251e1d4afd23d52e41dac99f85ed' }, { right: 'eca78e2f2a80018e8ba2ee4e2daad85dfb991462f281ee47fe9383c12dac9e6a' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'contact.phoneNumber', targetHash: 'd3c59b1575714b922772ac65ba2d62fd42b06d74402efa22c773d4694eb31535', value: 'urn:phoneNumber.country:63570b5c321f3e49a15b0da13ff092d2088f2325312598d1f946dd1c2d18080f:ZA|urn:phoneNumber.countryCode:752db3295210070f1db0fb04cd47d3957fc78f10072b7e194dc84314774a164e:27|urn:phoneNumber.lineType:fd727415632723ac7eaa9d6a39a1af08086fa0d74d33b17cb2a69417b1485218:mobile|urn:phoneNumber.number:9126a0d2b89a8396376d043776612c99c257b228dd7b1f65f1023780a9a9d43e:829283948|',
          }, {
            identifier: 'claim-cvc:PhoneNumber.country-v1', node: [{ left: 'd3c59b1575714b922772ac65ba2d62fd42b06d74402efa22c773d4694eb31535' }, { right: '098e94f02947f7c2aff642c47969b58a1532251e1d4afd23d52e41dac99f85ed' }, { right: 'eca78e2f2a80018e8ba2ee4e2daad85dfb991462f281ee47fe9383c12dac9e6a' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'contact.phoneNumber.country', targetHash: '60c8d1a05affc8066469e822733fe2b75f083f8ff3d6f03b9421c6f6ec4cd21f', value: 'urn:country:63570b5c321f3e49a15b0da13ff092d2088f2325312598d1f946dd1c2d18080f:ZA|',
          }, {
            identifier: 'claim-cvc:PhoneNumber.countryCode-v1', node: [{ right: '18a5f23c070cc27e84f54504b0d45cb8bee66a73e6aeb2089d17399497022dc2' }, { left: '4043681679e5c9239aa55883fe95437737ac5743f7bf0a660d185467961bec89' }, { right: 'eca78e2f2a80018e8ba2ee4e2daad85dfb991462f281ee47fe9383c12dac9e6a' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'contact.phoneNumber.countryCode', targetHash: '8864c6a4fbc869ca33c1296841ad3124cda0b0111a38fb8a06b783954285a84b', value: 'urn:countryCode:752db3295210070f1db0fb04cd47d3957fc78f10072b7e194dc84314774a164e:27|',
          }, {
            identifier: 'claim-cvc:PhoneNumber.lineType-v1', node: [{ left: '8864c6a4fbc869ca33c1296841ad3124cda0b0111a38fb8a06b783954285a84b' }, { left: '4043681679e5c9239aa55883fe95437737ac5743f7bf0a660d185467961bec89' }, { right: 'eca78e2f2a80018e8ba2ee4e2daad85dfb991462f281ee47fe9383c12dac9e6a' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'contact.phoneNumber.lineType', targetHash: '18a5f23c070cc27e84f54504b0d45cb8bee66a73e6aeb2089d17399497022dc2', value: 'urn:lineType:fd727415632723ac7eaa9d6a39a1af08086fa0d74d33b17cb2a69417b1485218:mobile|',
          }, {
            identifier: 'claim-cvc:PhoneNumber.number-v1', node: [{ right: '4540ef4a79d9b00ad2599e68f5c7516f4a7e99cffc9abe1891354a598245278c' }, { right: '62388a734b211fc9562dca9eeb16abb9cc24026e3d72716dee091403f167fd59' }, { left: 'ce713e6305763707b67bb7209f44b2ca1c8f556f379aecc6b9c9e6621e9e5597' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'contact.phoneNumber.number', targetHash: '23d8323a124f3890f87bd58700cf5f2e7df31a3cfed37447847c0b449123054f', value: 'urn:number:9126a0d2b89a8396376d043776612c99c257b228dd7b1f65f1023780a9a9d43e:829283948|',
          }, {
            identifier: 'cvc:Meta:issuer', node: [{ left: '23d8323a124f3890f87bd58700cf5f2e7df31a3cfed37447847c0b449123054f' }, { right: '62388a734b211fc9562dca9eeb16abb9cc24026e3d72716dee091403f167fd59' }, { left: 'ce713e6305763707b67bb7209f44b2ca1c8f556f379aecc6b9c9e6621e9e5597' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'meta.issuer', targetHash: '4540ef4a79d9b00ad2599e68f5c7516f4a7e99cffc9abe1891354a598245278c', value: 'urn:issuer:b7a95062da46ef771d9b69c905822e1f415a2a247d4e919a112e557e3a530671:did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233|',
          }, {
            identifier: 'cvc:Meta:issuanceDate', node: [{ right: '52b26e10cd074a3561d09fce6ec4e8fbefd3d8a1efdd6b9d8976b23f47b69d69' }, { left: '31742981f3647c6119514bd6405e97f2a5a7d058e425a07edb9826679b534bed' }, { left: 'ce713e6305763707b67bb7209f44b2ca1c8f556f379aecc6b9c9e6621e9e5597' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'meta.issuanceDate', targetHash: '24e3da13ac406ce4f22993d9e7a17249c7aed331e3164603e189e8e4abcb4234', value: 'urn:issuanceDate:d46f4354b18f0553ee2ea0ca75d4da3598b6877e3f214d7e9eb27dfec8dddd3b:2021-05-28T10:59:52.372Z|',
          }, {
            identifier: 'cvc:Meta:expirationDate', node: [{ left: '24e3da13ac406ce4f22993d9e7a17249c7aed331e3164603e189e8e4abcb4234' }, { left: '31742981f3647c6119514bd6405e97f2a5a7d058e425a07edb9826679b534bed' }, { left: 'ce713e6305763707b67bb7209f44b2ca1c8f556f379aecc6b9c9e6621e9e5597' }, { right: 'a0e03ea307e8da03d7f63bb4503ef6e7a9cd16ab388f7293dc9c929b1ded5795' }, { right: 'b1a54752d39842b3520f4a1e12a28dd76e04c842b9b912c22d3f839f0a755e48' }], claimPath: 'meta.expirationDate', targetHash: '52b26e10cd074a3561d09fce6ec4e8fbefd3d8a1efdd6b9d8976b23f47b69d69', value: 'urn:expirationDate:08e312874e6cefc3cd34aee2cd86e0316f1b70ed4311e2afbc11f3df4558071c:null|',
          }],
          anchor: {
            schema: 'bch-20180201',
            deletedAt: -1,
            tx: '01000000019995192216338e3bc0fb90e5e7129cdffaa388c33ba024ec5c01f57fb08f40de00000000fdfd000047304402203352579178c5ffab3da7a924d9f609978737dd921f22b04f7a19eb55eeff590402205ce56e6e7b564d2bc8620bb39701fba502090e6b43163dfccfd05c3a6cbb61dd01483045022100eb0514d00e0ec128ef5ea2cef1f922d29002540926e625a32e7924ee02a5719302203254be58618bc36f8ddf04b083fdb7148913f4a4120701a85464918b9fefef7f014c695221033753071d26a5b8e80557785b86da700990db1fbd37b995141afe2b4b3d8fc2632102cb2426c9a2a5a6d17a37114d9c485cb22f2ad35ae071a5e3d8686db1393d40af2103153ee4a55c6f288d7dbeefb4ed91df7beb5f01d4e8eebe202cd44a9278f9bca853aeffffffff01551500000000000017a914b8df821ecd398777dd38238cd103ca564224f5a98700000000',
            subject: {
              label: 'credential-cvc:PhoneNumber-v1', pub: 'xpub6aAXEmqoPdQ1o68g5gQKG4yzzGmebFxMf1tj294C84mxtmbqRZR5FVkXXB4GvDQ3fi6pPSTAXy499z8h4HMYSA2M27NuabfQ9nSEQUEryLg', data: 'e5bb48bbaa2ea41b1e87f719e8f5b25dcdb16d2f8647abb376477da44e1cd959', signature: '3044022025fc2925617977a42bc6f9590140d4af6e3e99cad1b72ffe98a2f4d81d024eac02206f06a0d193571b1be920bd6b0b563c6ce6969b3d98d5ca96dd3ad8c179de11c9',
            },
            requestId: '60b0cd2ea53915005931bfe5',
            authority: { pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq', path: '/1/0/0/0' },
            _id: '60b0cd2fa53915005931bfe6',
            cosigners: [{ pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq' }, { pub: 'xpub661MyMwAqRbcGqg7oAqhbwrok1ekiQFFxBe1Eb33CVEQeoNzyWHHE4g42gWecn7Lse38HunBaSaUjBDRHJ6kKMcL3Lpi3gUvTh1RErfECH8' }],
            type: 'temporary',
            network: 'bitcoincash',
          },
        },
        type: ['VerifiableCredential', 'IdentityCredential'],
        version: '1',
        issuer: 'did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233',
        granted: '3045022100e67b2e1cb599392848a85762c4fd5d6b12c2ee4cc12cd8db2ab19271317d3ea8022015bb51237d5bdf9b85b32b4985341eba09e2ed6dd5dd8d8949c421f35a8f9fa7',
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.identity.com/credentials/v1'],
        credentialSubject: { id: 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF#default' },
        meta: { type: ['Credential', 'credential-cvc:PhoneNumber-v1'], issuanceDate: '2021-05-28T10:59:52.372Z' },
      }],
      proof: {
        type: 'JsonWebSignature2020', created: '2021-10-26T12:56:05Z', verificationMethod: 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF#default', proofPurpose: 'authentication', challenge: '6f5ce4dc-c348-4026-bc0a-a292615360c2', jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..2ia-Vv5NSi5eFB_6sgjek0UdEVv0aS7aoXHMeZgWIHHxFuGb3QKUFnQ1xPuxjSX-gIurYSPbsWOdHA7CuhwHBg',
      },
    };
  },
});
</script>
