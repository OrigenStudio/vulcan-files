import { GraphQLError } from 'graphql';
import { GraphQLSchema } from 'meteor/vulcan:lib';

GraphQLSchema.addSchema(`
  # A file upload.
  scalar File
`);

GraphQLSchema.addResolvers({
  File: {
    __serialize(value) {
      return value;
    },
    __parseValue(value) {
      return value;
    },
    __parseLiteral(value) {
      // Maybe support base64 here?
      throw new GraphQLError('File literals are not allowed.', [value]);
    }
  }
});
