import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";
import { useAuthSession, useAuthSignin, useAuthSignout } from "./plugin@auth";
import { Form } from "@builder.io/qwik-city";
import CSS from "./layout.css?inline";

export default component$(() => {
  useStylesScoped$(CSS);
  const authSession = useAuthSession();
  const authSignin = useAuthSignin();
  const authSignout = useAuthSignout();
  return (
    <>
      <header>
        {authSession.value ? (
          <>
            {authSession.value?.user?.image && (
              <img
                height={20}
                width={20}
                src={authSession.value?.user?.image}
              />
            )}
            {authSession.value?.user?.email && (
              <a href={authSession.value?.user?.email}>
                {authSession.value?.user?.email}
              </a>
            )}
            <Form action={authSignout}>
              <button>Sign Out</button>
            </Form>
          </>
        ) : (
          <>
            <Form action={authSignin}>
              <input type="hidden" name="providerId" value="github" />
              <button>GitHub</button>
            </Form>
          </>
        )}
      </header>
      <Slot />
    </>
  );
});
