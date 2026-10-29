import { defineRecordAttachmentPersistence } from "../../attachment/index.ts";
import { identityManifestsRecordAttachment } from "./definition.ts";
export const identityManifestsRecordAttachmentPersistence = defineRecordAttachmentPersistence({ attachment: identityManifestsRecordAttachment, revision: 1 });
