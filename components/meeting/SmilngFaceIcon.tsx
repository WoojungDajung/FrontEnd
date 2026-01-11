const SmilingFaceIcon = () => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="23.5"
        fill="var(--color-primary-25)"
      />
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="23.5"
        stroke="var(--color-primary-400)"
        stroke-dasharray="4 4"
      />
      <ellipse
        cx="18"
        cy="22.5"
        rx="1.5"
        ry="3.5"
        fill="var(--color-primary-400)"
      />
      <ellipse
        cx="30"
        cy="22.5"
        rx="1.5"
        ry="3.5"
        fill="var(--color-primary-400)"
      />
      <path
        d="M15 28C15 28 17.1429 33 24 33C30.8571 33 33 28 33 28"
        stroke="var(--color-primary-400)"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default SmilingFaceIcon;
