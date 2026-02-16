const PlusIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <mask
        id="a"
        width="24"
        height="24"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{
          maskType: "alpha",
        }}
      >
        <path fill="#d9d9d9" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#a)">
        <path
          fill="var(--color-gray-600)"
          d="M11.143 12.857H6.857a.857.857 0 1 1 0-1.714h4.286V6.857a.857.857 0 1 1 1.714 0v4.286h4.286a.857.857 0 0 1 0 1.714h-4.286v4.286a.857.857 0 0 1-1.714 0z"
        />
      </g>
    </svg>
  );
};

export default PlusIcon;
