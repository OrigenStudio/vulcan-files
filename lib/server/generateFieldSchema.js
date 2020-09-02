import merge from "lodash/merge";

import generateFieldSchemaBase from "../modules/generateFieldSchemaBase";
import fieldCallbacks from "./fieldCallbacks";
import fieldResolver from "./fieldResolver";

/**
 * Server's function to generate a field schema. What this basically does is to
 * create the insert and edit handlers (with {@link createHandlers}) and provide
 * them to {@link generateFieldSchemaBase}.
 *
 * See {@link generateFieldSchemaBase} for instruction is how to use this function
 * to generate the schema.
 *
 * @param {Object} options Options
 *  Accepts options from both {@link generateFieldSchemaBase} and {@link createHandlers}.
 * @return {Object}
 * @function generateFieldSchema
 */
export default (options = {}) => {
  const { fieldSchema = {} } = options;

  return generateFieldSchemaBase({
    ...options,
    fieldSchema: merge({}, fieldSchema, {
      ...fieldCallbacks(options), // onCreate / onUpdate / onDelete callbacks to upload the file
      resolveAs: {
        resolver: fieldResolver(options),
      },
    }),
  });
};
