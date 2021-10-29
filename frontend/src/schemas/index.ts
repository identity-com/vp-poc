import { CVCSchemaLoader } from '@identity.com/credential-commons';
import { uca } from '@/schemas/meta.json';
import identifiers from './schemas';

const identifierPattern = /(claim|credential|uca|type)-((\w+):[\w.:]+)-v(\d+)/;
const parseIdentifier = (identifier:string) => identifier.match(identifierPattern);

const getIdentifierPath = (identifier:string) => {
  let identifierPath;

  if (/^cvc:.*$/.test(identifier)) {
    identifierPath = `uca/1/${identifier}`;
  } else {
    const parsedIdentifier = parseIdentifier(identifier);

    if (parsedIdentifier) {
      identifierPath = `${parsedIdentifier[1]}/${parsedIdentifier[4]}/${parsedIdentifier[2]}`;
    }
  }

  return identifierPath;
};

export default class extends CVCSchemaLoader {
  constructor() {
    super(undefined, null);
  }

  async loadSchema(identifier:string) {
    if (uca.includes(identifier)) {
      return null;
    }

    let schema = this.loadLocalSchema(identifier);

    if (!schema) {
      schema = super.loadSchema(identifier);
    }

    return schema;
  }

  // eslint-disable-next-line class-methods-use-this
  loadLocalSchema(identifier:string) {
    if (identifiers[identifier]) {
      return identifiers[identifier];
    }

    return null;
  }
}
