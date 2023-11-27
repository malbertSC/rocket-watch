import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const UsersDatastore = DefineDatastore({
  name: "Users",
  primary_key: "team_slack_channel_id",
  attributes: {
    team_slack_channel_id: {
      type: Schema.slack.types.channel_id,
    },
    slack_user_ids: {
      type: Schema.types.array,
      items: {
        type: Schema.slack.types.user_id,
      },
    },
  },
});
