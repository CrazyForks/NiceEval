export default {
  "format": "concord.project/v1",
  "projectId": "niceeval-repot-tool",
  "testRoots": [],
  "sourceRoots": ["packages/niceeval/src"],
  "runner": {
    "kind": "node-test",
    "sourceFiles": [],
    "timeoutMs": 60000
  },
  "feedbackConnections": [
    {
      "id": "niceeval-github",
      "provider": "github",
      "owner": "NiceEval",
      "repo": "NiceEval",
      "repositoryId": "1283126461",
      "transport": "gh"
    }
  ]
} as const;
