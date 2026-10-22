import { defineRecordAttachmentPersistence } from "../../attachment/index.ts";
import { attemptNotesRecordAttachment } from "./definition.ts";

export const attemptNotesRecordAttachmentPersistence = defineRecordAttachmentPersistence({
  attachment: attemptNotesRecordAttachment,
  revision: 1,
});
