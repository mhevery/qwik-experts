import {
  component$,
  useComputed$,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";
import CSS from "./index.css?inline";
import { GitForkLine } from "./fork";

type OrgReposResponse =
  paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

export const useRepositories = routeLoader$(async ({ params, env }) => {
  const response = await fetch(
    `https://api.github.com/users/${params.user}/repos?per_page=100`,
    {
      headers: {
        "User-Agent": "Qwik Masters",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  return (await response.json()) as OrgReposResponse;
});

export default component$(() => {
  useStylesScoped$(CSS);
  const repositories = useRepositories();
  const filter = useSignal("");
  const filteredRepos = useComputed$(() => {
    return repositories.value.filter((repo) =>
      repo.name.toLowerCase().includes(filter.value.toLowerCase())
    );
  });
  return (
    <div>
      <h1>Repositories for {repositories.value[0].owner.login}</h1>
      <input bind:value={filter} />
      <ul class="card-list">
        {filteredRepos.value.map((repo, idx) => (
          <li key={idx} class="card-item">
            <a href={`/github/${repo.full_name}/`}>
              <div>{repo.name}</div>
              <div>
                ★{repo.stargazers_count}
                <GitForkLine />
                {repo.forks_count}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
