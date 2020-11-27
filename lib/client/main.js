import { registerTerminatingLink } from "meteor/vulcan:lib";
import { createUploadLink } from "apollo-upload-client";
import { customFetch } from "./customFetch";

registerTerminatingLink(createUploadLink({ fetch: customFetch }));

export * from "../modules";
export { default as generateFieldSchema } from "../modules/generateFieldSchemaBase";
export { default as createFSCollection } from "./createFSCollectionStub";
