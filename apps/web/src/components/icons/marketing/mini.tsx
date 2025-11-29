import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function NoteIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="6" y="6" width="36" height="36" rx="8" fill="#FEE2C7" />
      <rect x="12" y="14" width="24" height="4" rx="2" fill="#8A4603" />
      <rect x="12" y="22" width="18" height="4" rx="2" fill="#8A4603" opacity="0.8" />
      <rect x="12" y="30" width="20" height="4" rx="2" fill="#8A4603" opacity="0.6" />
    </svg>
  );
}

export function SpeakingIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 12h24c2.761 0 5 2.239 5 5v8c0 2.761-2.239 5-5 5H20l-8 8v-8h-.5c-2.761 0-5-2.239-5-5v-8c0-2.761 2.239-5 5-5Z"
        fill="#FEE2C7"
      />
      <circle cx="18" cy="21" r="2.5" fill="#8A4603" />
      <circle cx="24" cy="21" r="2.5" fill="#8A4603" />
      <circle cx="30" cy="21" r="2.5" fill="#8A4603" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M32 6H16c-1.105 0-2 .895-2 2v5c0 4.971 4.029 9 9 9h2c4.971 0 9-4.029 9-9V8c0-1.105-.895-2-2-2Z"
        fill="#FCA855"
      />
      <path
        d="M14 8H8c-1.105 0-2 .895-2 2v3c0 4.418 3.582 8 8 8"
        stroke="#8A4603"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M34 8h6c1.105 0 2 .895 2 2v3c0 4.418-3.582 8-8 8"
        stroke="#8A4603"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 26h10v3a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5v-3Z"
        fill="#FCA855"
        stroke="#8A4603"
        strokeWidth="2"
      />
      <rect x="16" y="34" width="16" height="5" rx="2.5" fill="#8A4603" opacity="0.9" />
    </svg>
  );
}

export function SmileyFaceIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#FEE2C7" />
      <circle cx="17" cy="20" r="3" fill="#8A4603" />
      <circle cx="31" cy="20" r="3" fill="#8A4603" />
      <path
        d="M16 28c2 3 5 5 8 5s6-2 8-5"
        stroke="#8A4603"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function QuotesIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18 16c-3.866 0-7 3.134-7 7v10h9v-7h-3c0-1.657 1.343-3 3-3V16Z" fill="#FCA855" />
      <path
        d="M34 16c-3.866 0-7 3.134-7 7v10h9v-7h-3c0-1.657 1.343-3 3-3V16Z"
        fill="#FCA855"
        opacity="0.7"
      />
    </svg>
  );
}
