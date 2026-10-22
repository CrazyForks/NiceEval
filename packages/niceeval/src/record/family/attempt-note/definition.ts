import { defineRecordAttachment, RecordOwner } from "../../attachment/index.ts";
import { AttemptNotesSchema } from "./schema.ts";

export const attemptNotesRecordAttachment = defineRecordAttachment({
  owner: RecordOwner.attempt,
  family: "niceeval.attempt-note",
  schema: AttemptNotesSchema,
  validate: () => [],
});
