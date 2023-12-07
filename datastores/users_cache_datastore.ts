import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export default DefineDatastore({
  name: "UsersCache",
  primary_key: "username",
  attributes: {
    username: {
      type: Schema.types.string,
    },
    slack_user_id: {
      type: Schema.slack.types.user_id,
    },
  },
});
