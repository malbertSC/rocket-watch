import { Manifest } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "./datastores/sample_datastore.ts";
import CollectRocketFeedbackWorkflow from "./workflows/collect_rocket_feedback.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "rocket-watch",
  description: "A template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  workflows: [CollectRocketFeedbackWorkflow],
  outgoingDomains: [],
  datastores: [SampleObjectDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
