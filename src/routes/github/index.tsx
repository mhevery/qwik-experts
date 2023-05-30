import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";
import { createServerClient } from "supabase-auth-helpers-qwik";

type SearchUsersResponse =
  paths["/search/users"]["get"]["responses"]["200"]["content"]["application/json"];

const fetchListOfUsers = server$(async function (query: string) {
  const response = await fetch(
    "https://api.github.com/search/users?q=" + query,
    {
      headers: {
        "User-Agent": "Qwik Workshop",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + this.env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  const users = (await response.json()) as SearchUsersResponse;
  return users.items;
});

export const useFavorites = routeLoader$(async (requestEv) => {
  const session = requestEv.sharedMap.get("session") as {
    user: {
      name: string;
      email: string;
      image: string;
    };
  } | null;

  const supabaseClient = createServerClient(
    requestEv.env.get("PUBLIC_SUPABASE_URL")!,
    requestEv.env.get("PUBLIC_SUPABASE_ANON_KEY")!,
    requestEv
  );
  const email = session?.user.email;
  if (email) {
    const { data, error } = await supabaseClient
      .from("favorite")
      .select("*")
      .eq("email", email);
    if (error) {
      throw error;
    }
    return data as Array<{ user: string; repo: string }>;
  }
  return [];
});

export default component$(() => {
  const favorites = useFavorites();
  return (
    <div>
      <h1>Search</h1>
      <ul>
        {favorites.value.map((favorite, id) => (
          <li key={id}>
            <a href={`/github/${favorite.user}/${favorite.repo}`}>
              {favorite.user}/{favorite.repo}
            </a>
          </li>
        ))}
      </ul>
      <Search />
    </div>
  );
});

export const Search = component$(() => {
  const search = useSignal("");
  const searchDebounce = useSignal("");
  useTask$(({ track, cleanup }) => {
    const value = track(() => search.value);
    const id = setTimeout(() => (searchDebounce.value = value), 500);
    cleanup(() => clearTimeout(id));
  });
  const user = useResource$(async ({ track }) => {
    const query = track(() => searchDebounce.value);
    if (query) {
      return fetchListOfUsers(query);
    } else {
      return [];
    }
  });
  return (
    <>
      <input type="text" bind:value={search} />
      <Resource
        value={user}
        onPending={() => <>loading...</>}
        onResolved={(repositories) => (
          <ul>
            {repositories.map((user) => (
              <li key={user.id}>
                <a href={`/github/${user.login}`}>{user.login}</a>
              </li>
            ))}
          </ul>
        )}
      />
    </>
  );
});
