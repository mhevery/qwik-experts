import { type QwikIntrinsicElements } from "@builder.io/qwik";

export function GitForkLine(props: QwikIntrinsicElements["svg"], key: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
      key={key}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle
          cx="6"
          cy="6"
          r="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></circle>
        <circle
          cx="18"
          cy="6"
          r="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></circle>
        <circle
          cx="12"
          cy="18"
          r="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></circle>
        <path d="M6 9v1a2 2 0 0 0 2 2h4m6-3v1a2 2 0 0 1-2 2h-4m0 0v3"></path>
      </g>
    </svg>
  );
}
