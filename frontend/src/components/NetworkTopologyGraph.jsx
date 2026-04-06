import React from "react";

const SUBNET_ICON = (
  <g transform="scale(0.9)">
    <rect
      x="0"
      y="0"
      width="4"
      height="4"
      rx="0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="8"
      y="0"
      width="4"
      height="4"
      rx="0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="4"
      y="8"
      width="4"
      height="4"
      rx="0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M6 4v4M4 10H2M10 10h-2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </g>
);

const HOST_ICON = (
  <g transform="scale(0.9)">
    <rect
      x="0"
      y="1"
      width="14"
      height="9"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M5 12h4M3 14h8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </g>
);

const PHONE_ICON = (
  <g transform="scale(0.9)">
    <rect
      x="3"
      y="0"
      width="8"
      height="15"
      rx="1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="7" cy="12" r="0.8" fill="currentColor" />
  </g>
);

const dummyTopology = {
  root: "Cynet",
  endpoints: [
    {
      name: "Adeline_Endpoint_MAC",
      children: [
        { subnet: "172.20.10.0", host: "Apple's MacBook Pro", type: "mac" },
        { subnet: "192.168.1.0", host: "adelinelp's MacBook Air", type: "mac" },
        { subnet: "192.168.100.0", host: "Administrator's MacBook Air", type: "mac" },
        { subnet: "192.168.8.0", host: "Adeline’s MacBook Air", type: "mac" },
      ],
    },
    {
      name: "Adeline_Endpoint_WIN",
      children: [
        { subnet: "10.1.1.0", host: "ws-buh", type: "win" },
        { subnet: "10.1.2.0", host: "buh2", type: "win" },
        { subnet: "10.1.2.0", host: "buh2", type: "win" },
        { subnet: "10.167.164.0", host: "ibsquare-realme-book", type: "win" },
        { subnet: "172.20.10.0", host: "DESKTOP-PBT0052", type: "win" },
        { subnet: "192.168.100.0", host: "shtyrlya-pc", type: "win" },
        { subnet: "192.168.100.0", host: "Worldsokol", type: "win" },
        { subnet: "192.168.5.0", host: "DESKTOP-1QBCD2R", type: "win" },
      ],
    },
    {
      name: "Emir Testing WIN",
      children: [{ subnet: "10.1.3.0", host: "WINS102", type: "phone" }],
    },
  ],
};

function curvedPath(x1, y1, x2, y2) {
  const dx = (x2 - x1) * 0.45;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function nodeColor(type) {
  if (type === "mac") return "#38bdf8";
  if (type === "phone") return "#38bdf8";
  return "#84cc16";
}

function HostIcon({ type, x, y, color }) {
  const icon = type === "phone" ? PHONE_ICON : HOST_ICON;

  return (
    <g transform={`translate(${x}, ${y})`} style={{ color }}>
      {icon}
    </g>
  );
}

export default function NetworkTopologyGraph() {
  const width = 1180;
  const rowGap = 56;

  const endpointX = 340;
  const subnetX = 610;
  const hostX = 890;
  const rootX = 95;
  const rootY = 340;

  const flatRows = [];

  dummyTopology.endpoints.forEach((endpoint) => {
    endpoint.children.forEach((child) => {
      flatRows.push({
        endpoint: endpoint.name,
        subnet: child.subnet,
        host: child.host,
        type: child.type,
      });
    });
  });

  const rows = flatRows.map((row, i) => ({
    ...row,
    y: 70 + i * rowGap,
  }));

  const endpointCenters = {};

  dummyTopology.endpoints.forEach((endpoint) => {
    const ys = rows
      .filter((r) => r.endpoint === endpoint.name)
      .map((r) => r.y);

    endpointCenters[endpoint.name] =
      ys.reduce((a, b) => a + b, 0) / ys.length;
  });

  const height = Math.max(520, (rows.at(-1)?.y ?? 470) + 50);

  return (
    <div className="network-topology">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="network-topology__svg"
        role="img"
        aria-label="Network topology diagram"
      >
        {/* root -> endpoint */}
        {Object.entries(endpointCenters).map(([endpointName, y]) => (
          <path
            key={`root-${endpointName}`}
            d={curvedPath(rootX + 55, rootY, endpointX - 30, y)}
            fill="none"
            stroke="rgba(148,163,184,0.28)"
            strokeWidth="2.2"
          />
        ))}

        {/* endpoint -> subnet + subnet -> host */}
        {rows.map((row, i) => (
          <React.Fragment key={`${row.endpoint}-${row.subnet}-${row.host}-${i}`}>
            <path
              d={curvedPath(
                endpointX + 36,
                endpointCenters[row.endpoint],
                subnetX - 26,
                row.y
              )}
              fill="none"
              stroke="rgba(148,163,184,0.24)"
              strokeWidth="2"
            />

            <line
              x1={subnetX + 55}
              y1={row.y}
              x2={hostX - 22}
              y2={row.y}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="2"
            />
          </React.Fragment>
        ))}

        {/* root */}
        <g
          transform={`translate(${rootX - 35}, ${rootY - 10})`}
          style={{ color: "#94a3b8" }}
        >
          <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.18" />
          <path d="M5 10l4-4 6 4-6 4-4-4z" fill="currentColor" />
        </g>

        <text
          x={rootX}
          y={rootY + 6}
          fill="#e5e7eb"
          fontSize="24"
          fontWeight="600"
        >
          Cynet
        </text>

        {/* endpoints */}
        {Object.entries(endpointCenters).map(([endpointName, y]) => (
          <g key={endpointName}>
            <text
              x={endpointX - 10}
              y={y + 6}
              textAnchor="end"
              fill="#ffffff"
              fontSize="18"
              fontWeight="500"
            >
              {endpointName}
            </text>

            <g
              transform={`translate(${endpointX}, ${y - 8})`}
              style={{ color: "#38bdf8" }}
            >
              {SUBNET_ICON}
            </g>
          </g>
        ))}

        {/* subnets + hosts */}
        {rows.map((row, i) => (
          <React.Fragment
            key={`labels-${row.endpoint}-${row.subnet}-${row.host}-${i}`}
          >
            <text
              x={subnetX}
              y={row.y + 6}
              textAnchor="end"
              fill="#ffffff"
              fontSize="16"
              fontWeight="500"
            >
              {row.subnet}
            </text>

            <g
              transform={`translate(${subnetX + 10}, ${row.y - 8})`}
              style={{ color: "#38bdf8" }}
            >
              {SUBNET_ICON}
            </g>

            <HostIcon
              type={row.type}
              x={hostX - 6}
              y={row.y - 9}
              color={nodeColor(row.type)}
            />

            <text
              x={hostX + 24}
              y={row.y + 6}
              fill="#ffffff"
              fontSize="16"
              fontWeight="500"
            >
              {row.host}
            </text>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}