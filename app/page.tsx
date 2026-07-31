"use client";

import {
  Activity,
  ArrowDownToLine,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleUserRound,
  Database,
  FileCheck2,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  DashboardData,
  RecentUser,
  demoDashboardData,
} from "@/lib/dashboard-data";

type Connection = {
  apiUrl: string;
  token: string;
};

type DataMode = "demo" | "live" | "loading" | "error";
type TimeRange = "7d" | "30d";

const localConnection: Connection = {
  apiUrl: process.env.NEXT_PUBLIC_WORKBEE_API_URL ?? "",
  token: process.env.NEXT_PUBLIC_WORKBEE_DASHBOARD_TOKEN ?? "",
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard, target: "overview" },
  { label: "People", icon: Users, target: "people" },
  { label: "Job demand", icon: BriefcaseBusiness, target: "job-demand" },
  { label: "Locations", icon: Globe2, target: "locations" },
  { label: "Documents", icon: FileCheck2, target: "documents" },
  { label: "Vault", icon: WalletCards, target: "vault" },
];

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat("en-US");
const currency = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatRelativeTime(value: string, reference: string) {
  const seconds = Math.round(
    (new Date(value).getTime() - new Date(reference).getTime()) / 1000,
  );
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, divisor] of ranges) {
    if (Math.abs(seconds) >= divisor) {
      return formatter.format(Math.round(seconds / divisor), unit);
    }
  }
  return "just now";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function MetricCard({
  label,
  value,
  hint,
  change,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  hint: string;
  change?: string;
  icon: typeof Users;
  tone?: "blue" | "violet" | "green" | "amber";
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span className="metric-card__icon">
          <Icon size={20} strokeWidth={2} />
        </span>
        {change ? <span className="trend-pill">{change}</span> : null}
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Search size={22} />
      <strong>No matching people</strong>
      <span>Try a different name, phone number, role, or location.</span>
    </div>
  );
}

function ConnectionDialog({
  connection,
  onClose,
  onSave,
  onDisconnect,
}: {
  connection: Connection;
  onClose: () => void;
  onSave: (connection: Connection) => void;
  onDisconnect: () => void;
}) {
  const [draft, setDraft] = useState(connection);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({
      apiUrl: draft.apiUrl.trim().replace(/\/+$/, ""),
      token: draft.token.trim(),
    });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="connection-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog__header">
          <div className="dialog__mark">
            <Database size={22} />
          </div>
          <div>
            <span>Live data</span>
            <h2 id="connection-title">Connect the Workbee API</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="dialog__copy">
          The API keeps PostgreSQL credentials private. Your admin key is kept
          only in this browser tab and is never included in the published site.
        </p>
        <form onSubmit={submit}>
          <label>
            API base URL
            <input
              type="url"
              placeholder="https://api.workbee.lk"
              required
              value={draft.apiUrl}
              onChange={(event) =>
                setDraft({ ...draft, apiUrl: event.target.value })
              }
            />
          </label>
          <label>
            Dashboard admin key
            <input
              type="password"
              placeholder="Enter the server-side admin key"
              required
              value={draft.token}
              onChange={(event) =>
                setDraft({ ...draft, token: event.target.value })
              }
            />
          </label>
          <div className="dialog__actions">
            {connection.token ? (
              <button
                className="button button--quiet danger-text"
                type="button"
                onClick={onDisconnect}
              >
                Disconnect
              </button>
            ) : (
              <span />
            )}
            <div>
              <button
                className="button button--quiet"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="button button--primary" type="submit">
                <ShieldCheck size={17} />
                Connect
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData>(demoDashboardData);
  const [mode, setMode] = useState<DataMode>("demo");
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState<Connection>({
    apiUrl: localConnection.apiUrl,
    token: localConnection.token,
  });
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [range, setRange] = useState<TimeRange>("30d");

  const loadDashboard = useCallback(async (nextConnection: Connection) => {
    if (!nextConnection.apiUrl || !nextConnection.token) {
      setData(demoDashboardData);
      setMode("demo");
      setMessage("");
      return;
    }

    setMode("loading");
    setMessage("");
    try {
      const response = await fetch(
        `${nextConnection.apiUrl}/api/v1/admin/dashboard`,
        {
          headers: {
            authorization: `Bearer ${nextConnection.token}`,
            accept: "application/json",
          },
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || `The API returned ${response.status}.`);
      }
      const nextData = (await response.json()) as DashboardData;
      setData(nextData);
      setMode("live");
    } catch (error) {
      setMode("error");
      setMessage(
        error instanceof Error ? error.message : "Could not reach the API.",
      );
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("workbee-dashboard-connection");
    let nextConnection = localConnection;
    try {
      if (saved) {
        nextConnection = JSON.parse(saved) as Connection;
      }
      if (!nextConnection.apiUrl || !nextConnection.token) return;
      queueMicrotask(() => {
        setConnection(nextConnection);
        void loadDashboard(nextConnection);
      });
    } catch {
      sessionStorage.removeItem("workbee-dashboard-connection");
    }
  }, [loadDashboard]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.recentUsers.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const matchesQuery =
        !needle ||
        [user.name, user.phoneNumber, user.location, user.language, user.id]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesRole && matchesQuery;
    });
  }, [data.recentUsers, query, role]);

  const chartData = useMemo(
    () => data.registrations.slice(range === "7d" ? -7 : -30),
    [data.registrations, range],
  );

  const maxJobCategory = Math.max(
    ...data.jobCategories.map((category) => category.value),
    1,
  );
  const summary = data.summary;

  const saveConnection = (nextConnection: Connection) => {
    setConnection(nextConnection);
    sessionStorage.setItem(
      "workbee-dashboard-connection",
      JSON.stringify(nextConnection),
    );
    setConnectionOpen(false);
    void loadDashboard(nextConnection);
  };

  const disconnect = () => {
    sessionStorage.removeItem("workbee-dashboard-connection");
    setConnection({ apiUrl: "", token: "" });
    setConnectionOpen(false);
    void loadDashboard({ apiUrl: "", token: "" });
  };

  const jumpTo = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  };

  const exportUsers = () => {
    const header = [
      "Name",
      "Phone",
      "Role",
      "Location",
      "Language",
      "Profile complete",
      "Documents",
      "Rating",
      "Vault balance",
      "Joined",
    ];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.phoneNumber,
      user.role,
      user.location,
      user.language,
      user.profileComplete ? "Yes" : "No",
      user.documents,
      user.rating,
      user.vaultBalance,
      user.joinedAt,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workbee-users.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand__mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>Workbee</strong>
            <span>Command Centre</span>
          </div>
          <button
            className="icon-button sidebar__close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Dashboard sections">
          <span className="nav-label">Workspace</span>
          {navigation.slice(0, 4).map(({ label, icon: Icon, target }) => (
            <button
              className={target === "overview" ? "nav-item is-active" : "nav-item"}
              key={target}
              onClick={() => jumpTo(target)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {target === "people" ? (
                <b>{compactNumber.format(summary.totalUsers)}</b>
              ) : null}
            </button>
          ))}
          <span className="nav-label nav-label--spaced">Operations</span>
          {navigation.slice(4).map(({ label, icon: Icon, target }) => (
            <button className="nav-item" key={target} onClick={() => jumpTo(target)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <button className="nav-item" onClick={() => setConnectionOpen(true)}>
            <Settings2 size={18} />
            <span>Data connection</span>
            <i className={`connection-dot connection-dot--${mode}`} />
          </button>
          <div className="admin-profile">
            <div className="avatar avatar--admin">CH</div>
            <div>
              <strong>Chiran</strong>
              <span>Administrator</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {mobileNavOpen ? (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <main>
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="topbar__title">
            <span>Operations</span>
            <strong>Overview</strong>
          </div>
          <div className="topbar__actions">
            <button
              className={`mode-chip mode-chip--${mode}`}
              onClick={() => setConnectionOpen(true)}
            >
              <span />
              {mode === "live"
                ? "Live database"
                : mode === "loading"
                  ? "Connecting"
                  : mode === "error"
                    ? "Connection issue"
                    : "Demo data"}
            </button>
            <button
              className="icon-button"
              onClick={() => void loadDashboard(connection)}
              aria-label="Refresh dashboard"
              disabled={mode === "loading"}
            >
              <RefreshCw
                size={18}
                className={mode === "loading" ? "spin" : ""}
              />
            </button>
            <button className="avatar avatar--button" aria-label="Open account menu">
              CH
            </button>
          </div>
        </header>

        <div className="dashboard">
          <section className="welcome" id="overview">
            <div>
              <span className="eyebrow">
                <Sparkles size={14} />
                Friday, 31 July
              </span>
              <h1>Good afternoon, Chiran.</h1>
              <p>Here&apos;s what is happening across Workbee today.</p>
            </div>
            <div className="welcome__actions">
              <button className="button button--quiet" onClick={exportUsers}>
                <ArrowDownToLine size={17} />
                Export
              </button>
              <button
                className="button button--primary"
                onClick={() => setConnectionOpen(true)}
              >
                <Database size={17} />
                {mode === "live" ? "Manage connection" : "Connect live data"}
              </button>
            </div>
          </section>

          {mode === "error" ? (
            <div className="notice notice--error">
              <span>
                <strong>Live data is unavailable.</strong> {message} Showing the
                last loaded data.
              </span>
              <button onClick={() => setConnectionOpen(true)}>Review connection</button>
            </div>
          ) : mode === "demo" ? (
            <div className="notice">
              <span>
                <strong>Preview mode.</strong> Connect the Workbee API to replace
                this realistic sample with live PostgreSQL data.
              </span>
              <button onClick={() => setConnectionOpen(true)}>Connect now</button>
            </div>
          ) : null}

          <section className="metric-grid" aria-label="Platform summary">
            <MetricCard
              label="Total people"
              value={fullNumber.format(summary.totalUsers)}
              hint={`${fullNumber.format(summary.employees)} employees · ${fullNumber.format(summary.employers)} employers`}
              change={`+${summary.newUsers30d} this month`}
              icon={Users}
              tone="blue"
            />
            <MetricCard
              label="Profile completion"
              value={`${summary.profileCompletion.toFixed(1)}%`}
              hint="Employee and employer profiles"
              change="+4.2%"
              icon={CircleUserRound}
              tone="violet"
            />
            <MetricCard
              label="Document coverage"
              value={`${summary.documentCoverage.toFixed(1)}%`}
              hint="Employees with core documents"
              change="+7.8%"
              icon={FileCheck2}
              tone="green"
            />
            <MetricCard
              label="Vault balance"
              value={currency.format(summary.vaultBalance)}
              hint="Total across all accounts"
              icon={WalletCards}
              tone="amber"
            />
          </section>

          <section className="analytics-grid">
            <article className="panel panel--wide">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Growth</span>
                  <h2>New registrations</h2>
                  <p>Accounts created and profiles completed.</p>
                </div>
                <div className="range-switch" aria-label="Chart range">
                  <button
                    className={range === "7d" ? "is-active" : ""}
                    onClick={() => setRange("7d")}
                  >
                    7 days
                  </button>
                  <button
                    className={range === "30d" ? "is-active" : ""}
                    onClick={() => setRange("30d")}
                  >
                    30 days
                  </button>
                </div>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot legend-dot--blue" />Registrations</span>
                <span><i className="legend-dot legend-dot--violet" />Profiles completed</span>
              </div>
              <div className="trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#075dee" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#075dee" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profilesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c5cf5" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#7c5cf5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#edf0f5" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={26}
                      tick={{ fill: "#8a92a5", fontSize: 11 }}
                      tickFormatter={(value) =>
                        new Date(`${value}T00:00:00`).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8a92a5", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ stroke: "#c8d2e7", strokeDasharray: "4 4" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e9f1",
                        boxShadow: "0 12px 30px rgba(23,50,107,.12)",
                        fontSize: 12,
                      }}
                      labelFormatter={(value) =>
                        new Date(`${value}T00:00:00`).toLocaleDateString("en", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <Area
                      dataKey="users"
                      name="Registrations"
                      type="monotone"
                      stroke="#075dee"
                      strokeWidth={2.5}
                      fill="url(#usersFill)"
                    />
                    <Area
                      dataKey="profiles"
                      name="Profiles completed"
                      type="monotone"
                      stroke="#7c5cf5"
                      strokeWidth={2.2}
                      fill="url(#profilesFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel" id="people">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Community</span>
                  <h2>People mix</h2>
                  <p>Active account roles.</p>
                </div>
                <Gauge size={19} className="panel__icon" />
              </div>
              <div className="donut-wrap">
                <div className="donut-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.roles}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {data.roles.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={index === 0 ? "#075dee" : "#9fb9f3"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-chart__label">
                    <strong>{compactNumber.format(summary.totalUsers)}</strong>
                    <span>people</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {data.roles.map((item, index) => (
                    <div key={item.name}>
                      <span>
                        <i className={index === 0 ? "role-dot role-dot--primary" : "role-dot"} />
                        {item.name}
                      </span>
                      <strong>{fullNumber.format(item.value)}</strong>
                      <small>{((item.value / summary.totalUsers) * 100).toFixed(1)}%</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="language-row">
                {data.languages.map((language) => (
                  <div key={language.name}>
                    <span>{language.name}</span>
                    <strong>{fullNumber.format(language.value)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="insight-grid">
            <article className="panel" id="job-demand">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Worker interests</span>
                  <h2>Top job categories</h2>
                </div>
                <BriefcaseBusiness size={19} className="panel__icon" />
              </div>
              <div className="rank-list">
                {data.jobCategories.map((category, index) => (
                  <div className="rank-row" key={category.name}>
                    <span className="rank-row__number">{index + 1}</span>
                    <div>
                      <div>
                        <strong>{category.name}</strong>
                        <span>{fullNumber.format(category.value)}</span>
                      </div>
                      <i>
                        <b
                          style={{
                            width: `${(category.value / maxJobCategory) * 100}%`,
                          }}
                        />
                      </i>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel" id="locations">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Coverage</span>
                  <h2>People by province</h2>
                </div>
                <Globe2 size={19} className="panel__icon" />
              </div>
              <div className="location-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.locations}
                    margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#edf0f5" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={92}
                      tick={{ fill: "#626b82", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f6f8fc" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e5e9f1" }}
                    />
                    <Bar dataKey="value" name="People" fill="#075dee" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel operational-panel" id="documents">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Readiness</span>
                  <h2>Profile health</h2>
                </div>
                <Activity size={19} className="panel__icon" />
              </div>
              <div className="health-score">
                <div>
                  <strong>{summary.documentCoverage.toFixed(0)}</strong>
                  <span>/100</span>
                </div>
                <p>Platform readiness score</p>
              </div>
              <div className="health-items">
                <div>
                  <span><Check size={14} />Profiles complete</span>
                  <strong>{summary.profileCompletion.toFixed(1)}%</strong>
                </div>
                <div>
                  <span><Check size={14} />Core documents</span>
                  <strong>{summary.documentCoverage.toFixed(1)}%</strong>
                </div>
                <div id="vault">
                  <span><WalletCards size={14} />Vault funded</span>
                  <strong>{currency.format(summary.vaultBalance)}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="panel people-panel">
            <div className="people-panel__header">
              <div>
                <span className="panel__kicker">Directory</span>
                <h2>Recently joined</h2>
                <p>The newest accounts across the Workbee community.</p>
              </div>
              <div className="people-tools">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Search people"
                    placeholder="Search people"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query ? (
                    <button aria-label="Clear search" onClick={() => setQuery("")}>
                      <X size={14} />
                    </button>
                  ) : null}
                </label>
                <label className="select-wrap">
                  <select
                    aria-label="Filter by role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="all">All roles</option>
                    <option value="employee">Employees</option>
                    <option value="employer">Employers</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                  <ChevronDown size={14} />
                </label>
                <button className="button button--quiet export-label" onClick={exportUsers}>
                  <ArrowDownToLine size={16} />
                  Export
                </button>
              </div>
            </div>

            {filteredUsers.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Person</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Profile</th>
                      <th>Documents</th>
                      <th>Rating</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: RecentUser) => (
                      <tr key={user.id}>
                        <td>
                          <div className="person-cell">
                            <span className="avatar">{initials(user.name)}</span>
                            <div>
                              <strong>{user.name}</strong>
                              <span>{user.phoneNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge role-badge--${user.role}`}>
                            {titleCase(user.role)}
                          </span>
                        </td>
                        <td>
                          <strong className="table-primary">{user.location}</strong>
                          <span className="table-secondary">{user.language}</span>
                        </td>
                        <td>
                          <span className={user.profileComplete ? "status status--good" : "status status--pending"}>
                            <i />
                            {user.profileComplete ? "Complete" : "Incomplete"}
                          </span>
                        </td>
                        <td>
                          <span className="document-count">
                            <FileCheck2 size={15} />
                            {user.documents}
                          </span>
                        </td>
                        <td>
                          <strong className="rating">★ {user.rating.toFixed(1)}</strong>
                        </td>
                        <td>
                          <span className="table-secondary">
                            {formatRelativeTime(user.joinedAt, data.generatedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState />
            )}
            <div className="table-footer">
              <span>
                Showing {filteredUsers.length} of {data.recentUsers.length} recent people
              </span>
              <span>
                Snapshot{" "}
                {new Date(data.generatedAt).toLocaleString("en-LK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Colombo",
                })}
              </span>
            </div>
          </section>

          <footer>
            <span>Workbee Command Centre</span>
            <span>Operational data is read-only.</span>
          </footer>
        </div>
      </main>

      {connectionOpen ? (
        <ConnectionDialog
          connection={connection}
          onClose={() => setConnectionOpen(false)}
          onSave={saveConnection}
          onDisconnect={disconnect}
        />
      ) : null}
    </div>
  );
}
