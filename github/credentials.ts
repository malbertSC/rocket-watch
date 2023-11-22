import { AxiosRequestConfig } from "axios";

export const credentials: AxiosRequestConfig = {
  headers: {
      "Content-Type": "application/json",
      "Accept": "application/vnd.github+json"
  },
  auth: {
      username: Deno.env.get("GITHUB_USERNAME") || "",
      password: Deno.env.get("GITHUB_PAT") || ""
  }
}