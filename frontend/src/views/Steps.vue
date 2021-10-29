<template>
  <v-main>
    <v-container>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Connect Cryptid

          <small v-if="did">
            <strong>DID:</strong> {{ did.did }}
          </small>
          <small v-if="did">
            <strong>Cryptid Account:</strong> {{ cryptidAccount }}
          </small>
          <small v-if="did">
            <small v-if="did">
              <strong>Public Key:</strong> {{ did.pubKey }}
            </small>
          </small>
        </v-stepper-step>

        <v-stepper-content step="1">
          <Cryptid
            :on-connected="onWalletConnected"
            :on-disconnected="onWalletDisconnected"
            :network="$config['solanaNetwork']"/>

        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Load Credentials via Civic
        </v-stepper-step>

        <v-stepper-content step="2">
          <Civic
            :app-id="$config['sipAppId']"
            :scope-request="$config['civicScopeRequest']"
            :on-auth-code-received="onAuthCodeRecevied"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          Exchange Token for Credentials
        </v-stepper-step>
        <v-stepper-content step="3">
          <CivicExchange
            :auth-code="civicAuthCode"
            :on-exchanged="onAuthCodeExchanged"
            :endpoint="$config['sipExchangeEndpoint']"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 4" step="4">
          Verifiable Credentials
        </v-stepper-step>
        <v-stepper-content step="4">
          <DisplayCredentials :credentials="credentials"/>
          <v-btn color="primary" outlined @click="createPresentation">
            Create Verifiable Presentation
          </v-btn>
        </v-stepper-content>

        <v-stepper-step :complete="step > 5" step="5">
          Verifiable Presentation
        </v-stepper-step>
        <v-stepper-content step="5">
          <div>&nbsp;</div>
          <v-textarea outlined readonly v-model="presentation" rows="12" class="display-text"/>
          <v-btn color="primary" outlined @click="signPresentation">
            Sign Verifiable Presentation
          </v-btn>
        </v-stepper-content>

        <v-stepper-step :complete="step > 6" step="6">
          Verify Presentation & Credentials
        </v-stepper-step>
        <v-stepper-content step="6">
          <VPValidator :presentation="signedVp" :on-verified="onProofVerified"
                       :account="cryptidAccount"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 7" step="7">
          Gateway Token
        </v-stepper-step>
        <v-stepper-content step="7">
          <div>&nbsp;</div>
          <v-textarea readonly rows="9" v-model="gkToken" label="Gateway Token"
                      outlined class="gk-token"/>
        </v-stepper-content>
      </v-stepper>
    </v-container>
  </v-main>
</template>
<style>
.gk-token {
  font-family: monospace;
  font-size: 11px;
  line-height: 11px !important;
}
</style>
<script lang="ts">
import Vue from 'vue';
import { Cryptid as CryptidInterface } from '@identity.com/cryptid';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { DIDDocument } from 'did-resolver';
import { GatewayToken } from '@identity.com/solana-gateway-ts';
import { VC } from '@identity.com/credential-commons';
import Cryptid from '@/components/Cryptid.vue';
import DisplayCredentials from '@/components/DisplayCredentials.vue';
import VPValidator from '@/components/VPValidator.vue';
import Civic from '@/components/Civic.vue';
import CivicExchange from '@/components/CivicExchange.vue';
import { presentation } from '@/lib';
import * as gatekeeper from '@/lib/gatekeeper';
// eslint-disable-next-line no-shadow
enum StepEnum {
  Connect = 1,
  SIP = 2,
  Exchange = 3,
  Credentials = 4,
  Presentation = 5,
  Validate = 6,
  Token = 7
}

interface ComponentData {
  step: StepEnum;
  cryptidAccount?: string;
  did: {
    did: string;
    keyname: string;
    pubKey: string;
    cryptid?: CryptidInterface;
    document?: DIDDocument;
  } | undefined;
  civicAuthCode: string;
  unsignedVp?: any;
  signedVp?: any;
  gkToken?: string
  credentials?: any[]
  presentation?: string
}

// Vue has a problem assigning the wallet to the component (due to the reactive getters)
let connectedWallet: WalletAdapter;

export default Vue.extend({
  components: {
    Cryptid,
    Civic,
    CivicExchange,
    VPValidator,
    DisplayCredentials,
  },
  data(): ComponentData {
    return {
      step: StepEnum.Connect,
      cryptidAccount: '',
      did: undefined,
      civicAuthCode: '',
      signedVp: undefined,
      unsignedVp: undefined,
      gkToken: undefined,
      credentials: undefined,
      presentation: undefined,
    };
  },
  methods: {
    async onWalletConnected(
      wallet: WalletAdapter,
      did: string,
      pubKey: string,
      keyname: string,
      document: DIDDocument,
    ) {
      connectedWallet = wallet;

      this.cryptidAccount = wallet.publicKey?.toBase58();

      this.did = {
        did,
        keyname,
        pubKey,
        document,
      };
      const vc = await VC.fromJSON(
        {
          identifier: 'credential-cvc:Email-v1',
          issuanceDate: '2021-05-28T10:59:06.638Z',
          transient: false,
          claim: {
            contact: {
              email: {
                domain: {
                  name: 'identity',
                  tld: 'org',
                },
                username: 'william',
              },
            },
          },
          id: '9dc83f2d-097d-4211-8ee0-6a54a04a18ce',
          proof: {
            merkleRoot: 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4',
            merkleRootSignature: {
              pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
              signature: '304402204747e81eacda23cd964d8b8b1eb9f8d2d615069aa3d5f12f2cb6e5dfba56e69602206035fc6b820bd8bdacf8e3b4c524d315cd8ded82f22c7c6786b7ed9e4a78e2d8',
              algo: 'ec256k1',
            },
            type: 'CvcMerkleProof2018',
            leaves: [
              {
                identifier: 'claim-cvc:Contact.email-v1',
                node: [
                  {
                    right: '90ef29c41a5d51762f5485cbe5850a34cb69b893a065c105b4834809f969525f',
                  },
                  {
                    right: 'f3ef0545a6f61f2e3389516ed0fc667f53497556bfda96bd8517ee69b900f7ce',
                  },
                  {
                    right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a',
                  },
                  {
                    right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e',
                  },
                  {
                    right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916',
                  },
                ],
                claimPath: 'contact.email',
                targetHash: 'd38bf743f973b93a0391cfdc459b0d028cb5f62b59d372b3e7b61cd44f1f82be',
                value: 'urn:email.domain.name:f706160ab6e2a87f154963a330786f8cdfe6d45a62692b08b3c0ff7aca82f653:identity|urn:email.domain.tld:fb0fa3808b73c8830337071eed9e1ee702e78b793ed58e9796eb9bf05ef0b125:org|urn:email.username:dce53904e0af2346d1684cd5c4566055f1b4518aa58b467a010d4e1f89d1d03e:william|',
              },
              {
                identifier: 'claim-cvc:Email.domain-v1',
                node: [
                  {
                    left: 'd38bf743f973b93a0391cfdc459b0d028cb5f62b59d372b3e7b61cd44f1f82be',
                  },
                  {
                    right: 'f3ef0545a6f61f2e3389516ed0fc667f53497556bfda96bd8517ee69b900f7ce',
                  },
                  {
                    right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a',
                  },
                  {
                    right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e',
                  },
                  {
                    right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916',
                  },
                ],
                claimPath: 'contact.email.domain',
                targetHash: '90ef29c41a5d51762f5485cbe5850a34cb69b893a065c105b4834809f969525f',
                value: 'urn:domain.name:f706160ab6e2a87f154963a330786f8cdfe6d45a62692b08b3c0ff7aca82f653:identity|urn:domain.tld:fb0fa3808b73c8830337071eed9e1ee702e78b793ed58e9796eb9bf05ef0b125:org|',
              },
              {
                identifier: 'cvc:Meta:issuer',
                node: [
                  {
                    right: '234c9e609469e17d515ebded93ebefd5b8bc3704af0ae05c47139ec3a5209b78',
                  },
                  {
                    left: '2b264a81e4c465f6008bfd6a16a850f8625634cecd9be2b395c1c3a1bdb08929',
                  },
                  {
                    right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a',
                  },
                  {
                    right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e',
                  },
                  {
                    right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916',
                  },
                ],
                claimPath: 'meta.issuer',
                targetHash: 'd04a1a4c2b12602b0d13ebe88fad8ca129cbe7a22fa0760a5a209fd07f180078',
                value: 'urn:issuer:2ea9477a333eb8b0f716e8ebbd6c32f71568f65a114f163f2ab23e1a1ef577e4:did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233|',
              },
              {
                identifier: 'cvc:Meta:issuanceDate',
                node: [
                  {
                    left: 'd04a1a4c2b12602b0d13ebe88fad8ca129cbe7a22fa0760a5a209fd07f180078',
                  },
                  {
                    left: '2b264a81e4c465f6008bfd6a16a850f8625634cecd9be2b395c1c3a1bdb08929',
                  },
                  {
                    right: 'fd8fc2fbabd2c570b2c92c15c2450e2c7415d9d186fa42ad92b6afaf366bf82a',
                  },
                  {
                    right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e',
                  },
                  {
                    right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916',
                  },
                ],
                claimPath: 'meta.issuanceDate',
                targetHash: '234c9e609469e17d515ebded93ebefd5b8bc3704af0ae05c47139ec3a5209b78',
                value: 'urn:issuanceDate:e2b1ff8b47e33cdf8ab4a10086e15d001b378b35aa021ba2c5588f1d0a8291d0:2021-05-28T10:59:06.638Z|',
              },
              {
                identifier: 'cvc:Meta:expirationDate',
                node: [
                  {
                    right: 'e177beab779472cf6dfab025e13c479755ab82cb31802f8b7149f3749559d5e1',
                  },
                  {
                    right: '38b1f6578eb6d962dbb4e84ffd478c3115f08f93b334d94ca38e9df5ba04897b',
                  },
                  {
                    left: '75c2de970bdd44049152fc9066b2489f5cade89643e5065454322887c425cd1a',
                  },
                  {
                    right: '0c894c162e89aef875a0b5b62a0fd066c03d53a401994f73bfd7cb448f9b9a9e',
                  },
                  {
                    right: 'e240a2e9739964c2d1e02821dc350a2aa20f2a067bc3290202f2fef4cc6af916',
                  },
                ],
                claimPath: 'meta.expirationDate',
                targetHash: 'dd2a692ca5d4c22af6b854c9f854c84cf7a30d303a428f48e5704eb0de53e666',
                value: 'urn:expirationDate:d5d341c83020245c776a5068f8fd833de8160a4870496ef3974095be0e03ed5b:null|',
              },
            ],
            anchor: {
              schema: 'bch-20180201',
              deletedAt: -1,
              tx: '0100000001559519221682129cedb54e3152eed3d41219cc9d99f055e051b7dd49d1a95db100000000fdfd00004830450221009560cb6807c2a5df77f73494e0146ae92ad2a9f02b91dd91452bc250dd8966f502205406659b223aabd46afa7cd47338293944351fd34d1614fef128dd96374f68f501473044022030c659150e5bc92873be65e71334b5b86a5ee6b4b2b0970d226c8fb56cce0b53022024bacc3c9e519646aaa518437755839a7d702268de3a7034a6ee6e6ecf31a13e014c695221033753071d26a5b8e80557785b86da700990db1fbd37b995141afe2b4b3d8fc263210221adead4299d69cdb6a6ac47deabe82ae48f87ee0ea3dfd5d04c406c54041b082103420025000c9b798992dd89afcfa899018991e2b250397c37dc4903ba3a89a6d753aeffffffff01551500000000000017a9149bf61235fecd70b5489cfd25672db58d7925b1058700000000',
              subject: {
                label: 'credential-cvc:Email-v1',
                pub: 'xpub6Z9RGgQFgDbtMKe4eNsjBH53HQ93xpLuXwQrCr6xtCwg95xEurwGBWPr3NjpULYdx6Jncz4efDaU9Wz3TH9E3YtTkFyt44fd5KNonMNj4Nx',
                data: 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4',
                signature: '304402201d7dac4a2abc330da69a530b79525783d82377a0bc677332037e92f27ee9e3340220458e8472c6d4103a479a8dbff78d52b51c3d40880cb28ab418a080cadcc95a83',
              },
              requestId: '60b0cd012bad43005ae58efa',
              authority: {
                pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq',
                path: '/1/0/0/0',
              },
              _id: '60b0cd022bad43005ae58efb',
              cosigners: [
                {
                  pub: 'xpub661MyMwAqRbcFSQxxk4YjLVG6gbFESS5SjW3Y5Shum2831RJJUfc1qSbSWYV871xsATMbDJYVsGo9BEBcupFsoSQQrV24eRet5epq2WFfZq',
                },
                {
                  pub: 'xpub661MyMwAqRbcEiwHUuCwD1HSFoKtqdHCmFCrdJsCRH4sc8KULwFpjQgLthVQq1rdTmAFqj4v7aj7KwewMK6ceQfvTpdVSrp8Zrncc3wGmWw',
                },
              ],
              type: 'temporary',
              network: 'bitcoincash',
            },
          },
          type: [
            'Credential',
            'credential-cvc:Email-v1',
          ],
          version: '1',
          issuer: 'did:ethr:0x4660613f3e5e84970ad0f4ad498389ecea2e1233',
          expirationDate: null,
          granted: '3045022100f07475acb7dc87b3f95f5f9e4ca01976337d0bb9ee6a662cbf4c0dfedc99dfef022061309131327ec6d2f6bb6b634fbbb4bd0953e6a13df5b80f8c69b8e2410bfd79',
        },
      );

      console.log(vc);
      this.step = StepEnum.SIP;
    },
    onWalletDisconnected() {
      this.did = undefined;
      this.cryptidAccount = '';
      this.step = StepEnum.Connect;
    },
    async onAuthCodeRecevied(token: string) {
      this.civicAuthCode = token;

      this.step = StepEnum.Exchange;
    },
    async onAuthCodeExchanged(data: { credentials: any }) {
      if (!this.did) {
        return;
      }

      this.credentials = data.credentials;
      console.log(this.credentials);
      this.step = StepEnum.Credentials;
    },
    async onProofVerified(token: GatewayToken) {
      this.gkToken = gatekeeper.prettyPrint(token);

      this.step = StepEnum.Token;
    },
    createPresentation() {
      this.unsignedVp = presentation.create(this.credentials as any[], `${this.did?.did}`);
      this.presentation = JSON.stringify(this.unsignedVp, null, 2);

      this.step = StepEnum.Presentation;
    },
    async signPresentation() {
      this.signedVp = await presentation.sign(connectedWallet, this.unsignedVp);

      this.step = StepEnum.Validate;
    },
  },
});
</script>
