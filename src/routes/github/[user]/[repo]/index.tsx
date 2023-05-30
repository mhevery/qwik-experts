import { component$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { type paths } from "@octokit/openapi-types";
import { createServerClient } from "supabase-auth-helpers-qwik";

type OrgRepoResponse =
  paths["/repos/{owner}/{repo}"]["get"]["responses"]["200"]["content"]["application/json"];

export const useRepository = routeLoader$(async ({ env, params }) => {
  const response = await fetch(
    `https://api.github.com/repos/${params.user}/${params.repo}`,
    {
      headers: {
        "User-Agent": "Qwik Masters",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  return (await response.json()) as OrgRepoResponse;
});

export const useFavorite = routeLoader$(async (requestEv) => {
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

  const user = session?.user.email;
  if (user) {
    const { data, error } = await supabaseClient
      .from("favorite")
      .select("*")
      .eq("user", requestEv.params.user)
      .eq("repo", requestEv.params.repo)
      .eq("email", user);

    if (error) {
      throw error;
    } else {
      return data.length > 0;
    }
  } else {
    return false;
  }
});

export const useSetFavorite = routeAction$(
  async (data, requestEv) => {
    const { user, repo, favorite } = data;
    const { sharedMap } = requestEv;
    const session = sharedMap.get("session") as {
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
    if (session) {
      if (favorite) {
        await supabaseClient.from("favorite").upsert({
          user,
          repo,
          email: session.user.email,
        });
      } else {
        await supabaseClient
          .from("favorite")
          .delete()
          .eq("user", user)
          .eq("repo", repo)
          .eq("email", session.user.email);
      }
    }
  },
  zod$({
    user: z.string(),
    repo: z.string(),
    favorite: z.coerce.boolean(),
  })
);

export default component$(() => {
  const location = useLocation();
  const repository = useRepository();
  const favorite = useFavorite();
  const setFavoriteAction = useSetFavorite();
  return (
    <div>
      <h1>
        Repo:{" "}
        <Link href={`/github/${location.params.user}/`}>
          {location.params.user}
        </Link>
        /{location.params.repo}
      </h1>
      <Form action={setFavoriteAction}>
        <input type="hidden" name="user" value={location.params.user} />
        <input type="hidden" name="repo" value={location.params.repo} />
        <input
          type="hidden"
          name="favorite"
          value={favorite.value ? "" : "true"}
        />
        <button>{favorite.value ? "✭" : "✩"}</button>
      </Form>
      <div>Description: {repository.value.description}</div>
      <div>Stars: {repository.value.stargazers_count}</div>
      <div>Forks: {repository.value.forks_count}</div>
    </div>
  );
});
