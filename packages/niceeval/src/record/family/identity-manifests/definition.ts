import { defineRecordAttachment, RecordOwner } from "../../attachment/index.ts";
import { IdentityManifestsAttachmentSchema, validateIdentityManifestsAttachment } from "./schema.ts";
export const identityManifestsRecordAttachment = defineRecordAttachment({
  owner: RecordOwner.run,
  family: "niceeval.identity-manifests",
  schema: IdentityManifestsAttachmentSchema,
  validate: validateIdentityManifestsAttachment,
});
