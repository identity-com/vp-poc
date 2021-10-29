import credentialcvcPhoneNumberv1 from '@/schemas/credential/1/cvc:PhoneNumber.schema.json';
import credentialcvcEmailv1 from '@/schemas/credential/1/cvc:Email.schema.json';
import ucacvcRandomnodev1 from '@/schemas/uca/1/cvc:Random:node.schema.json';
import ucacvcMetaissuanceDatev1 from '@/schemas/uca/1/cvc:Meta:issuanceDate.schema.json';
import ucacvcTypecountryv1 from '@/schemas/uca/1/cvc:Type:country.schema.json';
import ucacvcEmailusernamev1 from '@/schemas/uca/1/cvc:Email:username.schema.json';
import ucacvcMetaissuerv1 from '@/schemas/uca/1/cvc:Meta:issuer.schema.json';
import ucacvcMetaexpirationDatev1 from '@/schemas/uca/1/cvc:Meta:expirationDate.schema.json';
import ucacvcDomainnamev1 from '@/schemas/uca/1/cvc:Domain:name.schema.json';
import ucacvcDomaintldv1 from '@/schemas/uca/1/cvc:Domain:tld.schema.json';
import ucacvcTypedomainv1 from '@/schemas/uca/1/cvc:Type:domain.schema.json';
import claimcvcPhonelineTypev1 from '@/schemas/claim/1/cvc:Phone.lineType.schema.json';
import claimcvcEmaildomainv1 from '@/schemas/claim/1/cvc:Email.domain.schema.json';
import claimcvcPhoneNumbercountryCodev1 from '@/schemas/claim/1/cvc:PhoneNumber.countryCode.schema.json';
import claimcvcPhoneextensionv1 from '@/schemas/claim/1/cvc:Phone.extension.schema.json';
import claimcvcTypeemailv1 from '@/schemas/claim/1/cvc:Type.email.schema.json';
import claimcvcTypephoneNumberv1 from '@/schemas/claim/1/cvc:Type.phoneNumber.schema.json';
import claimcvcPhoneNumbernumberv1 from '@/schemas/claim/1/cvc:PhoneNumber.number.schema.json';
import claimcvcPhonecountryCodev1 from '@/schemas/claim/1/cvc:Phone.countryCode.schema.json';
import claimcvcContactemailv1 from '@/schemas/claim/1/cvc:Contact.email.schema.json';
import claimcvcPhoneNumberlineTypev1 from '@/schemas/claim/1/cvc:PhoneNumber.lineType.schema.json';
import claimcvcPhonenumberv1 from '@/schemas/claim/1/cvc:Phone.number.schema.json';
import claimcvcPhoneNumbercountryv1 from '@/schemas/claim/1/cvc:PhoneNumber.country.schema.json';
import claimcvcPhoneNumberextensionv1 from '@/schemas/claim/1/cvc:PhoneNumber.extension.schema.json';
import claimcvcContactphoneNumberv1 from '@/schemas/claim/1/cvc:Contact.phoneNumber.schema.json';

export default {
  'credential-cvc:PhoneNumber-v1': credentialcvcPhoneNumberv1,
  'credential-cvc:Email-v1': credentialcvcEmailv1,
  'cvc:Random:node': ucacvcRandomnodev1,
  'cvc:Meta:issuanceDate': ucacvcMetaissuanceDatev1,
  'cvc:Type:country': ucacvcTypecountryv1,
  'cvc:Email:username': ucacvcEmailusernamev1,
  'cvc:Meta:issuer': ucacvcMetaissuerv1,
  'cvc:Meta:expirationDate': ucacvcMetaexpirationDatev1,
  'cvc:Domain:name': ucacvcDomainnamev1,
  'cvc:Domain:tld': ucacvcDomaintldv1,
  'cvc:Type:domain': ucacvcTypedomainv1,
  'claim-cvc:Phone.lineType-v1': claimcvcPhonelineTypev1,
  'claim-cvc:Email.domain-v1': claimcvcEmaildomainv1,
  'claim-cvc:PhoneNumber.countryCode-v1': claimcvcPhoneNumbercountryCodev1,
  'claim-cvc:Phone.extension-v1': claimcvcPhoneextensionv1,
  'claim-cvc:Type.email-v1': claimcvcTypeemailv1,
  'claim-cvc:Type.phoneNumber-v1': claimcvcTypephoneNumberv1,
  'claim-cvc:PhoneNumber.number-v1': claimcvcPhoneNumbernumberv1,
  'claim-cvc:Phone.countryCode-v1': claimcvcPhonecountryCodev1,
  'claim-cvc:Contact.email-v1': claimcvcContactemailv1,
  'claim-cvc:PhoneNumber.lineType-v1': claimcvcPhoneNumberlineTypev1,
  'claim-cvc:Phone.number-v1': claimcvcPhonenumberv1,
  'claim-cvc:PhoneNumber.country-v1': claimcvcPhoneNumbercountryv1,
  'claim-cvc:PhoneNumber.extension-v1': claimcvcPhoneNumberextensionv1,
  'claim-cvc:Contact.phoneNumber-v1': claimcvcContactphoneNumberv1,

} as any;
