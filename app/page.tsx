"use client";

import {
  Activity,
  ArrowDownToLine,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CircleUserRound,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  Globe2,
  IdCard,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Phone,
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
  UserDetail,
  UserDocument,
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
  { label: "Job Demand", icon: BriefcaseBusiness, target: "job-demand" },
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

const displayAcronyms: Record<string, string> = {
  ai: "AI",
  api: "API",
  cctv: "CCTV",
  cv: "CV",
  gps: "GPS",
  id: "ID",
  it: "IT",
  ngo: "NGO",
  nic: "NIC",
  pdf: "PDF",
  qa: "QA",
  ui: "UI",
  url: "URL",
  ux: "UX",
};

const lowercaseDisplayWords = new Set([
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "to",
]);

function humanizeKey(value: string) {
  const words = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim()
    .split(/\s+/);

  return words
    .map((word, index) => {
      const normalized = word.toLowerCase();
      if (displayAcronyms[normalized]) return displayAcronyms[normalized];
      if (index > 0 && lowercaseDisplayWords.has(normalized)) return normalized;
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
}

function documentTypeLabel(value: string) {
  const identityDocumentLabels: Record<string, string> = {
    "nic-front": "NIC / Driver's License / Passport — Front",
    "nic-back": "NIC / Driver's License / Passport — Back",
  };
  return identityDocumentLabels[value] ?? humanizeKey(value);
}

function greetingForTime(value: Date) {
  const hour = value.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function languageLabel(value: string) {
  return (
    {
      en: "English",
      si: "Sinhala",
      ta: "Tamil",
    }[value] ?? value
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <strong>No Matching People</strong>
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
            <span>Live Data</span>
            <h2 id="connection-title">Connect the WorkBee API</h2>
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
            API Base URL
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
            Dashboard Admin Key
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

function ProfileDrawer({
  user,
  loading,
  error,
  documentLoading,
  onClose,
  onOpenDocument,
}: {
  user: UserDetail | null;
  loading: boolean;
  error: string;
  documentLoading: string;
  onClose: () => void;
  onOpenDocument: (document: UserDocument) => void;
}) {
  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        aria-label="User profile details"
        aria-modal="true"
        className="profile-drawer"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-drawer__top">
          <span>User Record</span>
          <button className="icon-button" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="profile-state">
            <LoaderCircle className="spin" size={28} />
            <strong>Loading Profile</strong>
            <span>Retrieving details and files from WorkBee.</span>
          </div>
        ) : error ? (
          <div className="profile-state profile-state--error">
            <CircleAlert size={28} />
            <strong>Could Not Open This Profile</strong>
            <span>{error}</span>
          </div>
        ) : user ? (
          <div className="profile-drawer__body">
            <section className="profile-identity">
              <div className="profile-avatar">{initials(user.name)}</div>
              <div>
                <span className={`role-badge role-badge--${user.role}`}>
                  {titleCase(user.role)}
                </span>
                <h2>{user.name}</h2>
                <p><IdCard size={13} />{user.id}</p>
              </div>
            </section>

            <section className="profile-summary">
              <div>
                <Phone size={16} />
                <span>Phone</span>
                <strong>{user.phoneNumber}</strong>
              </div>
              <div>
                <Globe2 size={16} />
                <span>Language</span>
                <strong>{languageLabel(user.language)}</strong>
              </div>
              <div>
                <CalendarDays size={16} />
                <span>Joined</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
              <div>
                <WalletCards size={16} />
                <span>Vault</span>
                <strong>{currency.format(user.vaultBalance)}</strong>
              </div>
            </section>

            {user.employeeProfile ? (
              <section className="profile-section">
                <div className="profile-section__heading">
                  <CircleUserRound size={17} />
                  <div>
                    <h3>Employee Details</h3>
                    <p>Personal and Location Information</p>
                  </div>
                </div>
                <dl className="detail-grid">
                  <div><dt>Full Name</dt><dd>{[user.employeeProfile.firstName, user.employeeProfile.surname].filter(Boolean).join(" ")}</dd></div>
                  <div><dt>Date of Birth</dt><dd>{formatDate(user.employeeProfile.dateOfBirth)}</dd></div>
                  <div><dt>Gender</dt><dd>{humanizeKey(user.employeeProfile.gender || "Not provided")}</dd></div>
                  <div><dt>Contact Number</dt><dd>{user.employeeProfile.contactNumber}</dd></div>
                  <div><dt>Province</dt><dd>{user.employeeProfile.province || "Not provided"}</dd></div>
                  <div><dt>City / Town</dt><dd>{[user.employeeProfile.city, user.employeeProfile.town].filter(Boolean).join(", ")}</dd></div>
                  <div className="detail-grid__wide"><dt>Division</dt><dd>{user.employeeProfile.division}</dd></div>
                  <div className="detail-grid__wide"><dt>Permanent Address</dt><dd>{user.employeeProfile.permanentAddress}</dd></div>
                  <div className="detail-grid__wide"><dt>Current Address</dt><dd>{user.employeeProfile.currentAddress || "Same as permanent address"}</dd></div>
                </dl>
              </section>
            ) : null}

            {user.employerProfile ? (
              <section className="profile-section">
                <div className="profile-section__heading">
                  <BriefcaseBusiness size={17} />
                  <div>
                    <h3>Employer Details</h3>
                    <p>Business and Contact Information</p>
                  </div>
                </div>
                <dl className="detail-grid">
                  <div><dt>Business</dt><dd>{user.employerProfile.businessName}</dd></div>
                  <div><dt>Contact Person</dt><dd>{user.employerProfile.contactName}</dd></div>
                  <div><dt>Contact Number</dt><dd>{user.employerProfile.contactNumber}</dd></div>
                  <div className="detail-grid__wide"><dt>Business Address</dt><dd>{user.employerProfile.businessAddress}</dd></div>
                </dl>
              </section>
            ) : null}

            <section className="profile-section">
              <div className="profile-section__heading">
                <BriefcaseBusiness size={17} />
                <div>
                  <h3>Job Preferences</h3>
                  <p>Categories and Roles This Person Selected</p>
                </div>
              </div>
              {user.jobPreferences.length ? (
                <div className="preference-groups">
                  {user.jobPreferences.map((preference) => (
                    <div key={preference.key}>
                      <strong>{humanizeKey(preference.key)}</strong>
                      <div>
                        {preference.subcategories.map((subcategory) => (
                          <span key={subcategory}>{humanizeKey(subcategory)}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-empty">No job preferences recorded.</p>
              )}
            </section>

            <section className="profile-section profile-section--files">
              <div className="profile-section__heading">
                <FileCheck2 size={17} />
                <div>
                  <h3>Files</h3>
                  <p>{user.documents.length} uploaded document{user.documents.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              {user.documents.length ? (
                <div className="file-list">
                  {user.documents.map((document) => (
                    <button
                      key={document.id}
                      onClick={() => onOpenDocument(document)}
                      disabled={documentLoading === document.id}
                    >
                      <span className="file-list__icon"><FileText size={18} /></span>
                      <span>
                        <strong>{documentTypeLabel(document.type)}</strong>
                        <small>{document.name} · {formatBytes(document.sizeBytes)}</small>
                      </span>
                      {documentLoading === document.id ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="profile-empty">No files uploaded for this person.</p>
              )}
            </section>

            {user.employeeProfile ? (
              <section className="profile-section emergency-card">
                <div className="profile-section__heading">
                  <Phone size={17} />
                  <div>
                    <h3>Emergency Contact</h3>
                    <p>Use Only When Necessary</p>
                  </div>
                </div>
                <strong>{user.employeeProfile.emergencyName}</strong>
                <span>{user.employeeProfile.emergencyPhone}</span>
                <p>{user.employeeProfile.emergencyAddress}</p>
              </section>
            ) : null}

            <div className="profile-audit">
              <span>Last Login: {formatDate(user.lastLoginAt)}</span>
              <span>Rating: ★ {user.rating.toFixed(1)}</span>
            </div>
          </div>
        ) : null}
      </aside>
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
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [documentLoading, setDocumentLoading] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

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
    const updateCurrentTime = () => setCurrentTime(new Date());
    updateCurrentTime();
    const timer = window.setInterval(updateCurrentTime, 60_000);
    return () => window.clearInterval(timer);
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
        [
          user.name,
          user.phoneNumber,
          user.location,
          user.language,
          user.id,
          ...user.jobPreferences.flatMap((preference) => [
            preference.key,
            humanizeKey(preference.key),
            ...preference.subcategories.flatMap((subcategory) => [
              subcategory,
              humanizeKey(subcategory),
            ]),
          ]),
        ]
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

  const openProfile = async (user: RecentUser) => {
    setProfileOpen(true);
    setSelectedUser(null);
    setProfileError("");
    setProfileLoading(true);

    if (mode !== "live") {
      setSelectedUser({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        language: user.language,
        role: user.role,
        rating: user.rating,
        vaultBalance: user.vaultBalance,
        phoneVerifiedAt: null,
        lastLoginAt: null,
        createdAt: user.joinedAt,
        updatedAt: user.joinedAt,
        employeeProfile: null,
        employerProfile: null,
        jobPreferences: user.jobPreferences,
        documents: [],
      });
      setProfileLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${connection.apiUrl}/api/v1/admin/users/${user.id}`,
        {
          headers: {
            authorization: `Bearer ${connection.token}`,
            accept: "application/json",
          },
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        user?: UserDetail;
        error?: string;
      };
      if (!response.ok || !body.user) {
        throw new Error(body.error || "The profile could not be loaded.");
      }
      setSelectedUser(body.user);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "The profile could not be loaded.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const openDocument = async (document: UserDocument) => {
    if (!selectedUser) return;
    const preview = window.open("", "_blank");
    setDocumentLoading(document.id);
    setProfileError("");
    try {
      const response = await fetch(
        `${connection.apiUrl}/api/v1/admin/users/${selectedUser.id}/documents/${document.id}`,
        {
          headers: {
            authorization: `Bearer ${connection.token}`,
          },
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || "The document could not be opened.");
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      if (preview) {
        preview.location.href = objectUrl;
      } else {
        window.location.href = objectUrl;
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      preview?.close();
      setProfileError(
        error instanceof Error
          ? error.message
          : "The document could not be opened.",
      );
    } finally {
      setDocumentLoading("");
    }
  };

  const exportUsers = () => {
    const header = [
      "Name",
      "Phone",
      "Role",
      "Location",
      "Language",
      "Job Preferences",
      "Profile Complete",
      "Documents",
      "Rating",
      "Vault Balance",
      "Joined",
    ];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.phoneNumber,
      user.role,
      user.location,
      user.language,
      user.jobPreferences
        .flatMap((preference) => [
          humanizeKey(preference.key),
          ...preference.subcategories.map(humanizeKey),
        ])
        .join("; "),
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
            <strong>WorkBee</strong>
            <span>Dashboard</span>
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
            <span>Data Connection</span>
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
                ? "Live Database"
                : mode === "loading"
                  ? "Connecting"
                  : mode === "error"
                    ? "Connection Issue"
                    : "Demo Data"}
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
                {currentTime
                  ? currentTime.toLocaleDateString("en-LK", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "Today"}
              </span>
              <h1>
                {currentTime
                  ? `${greetingForTime(currentTime)}, Chiran.`
                  : "Welcome, Chiran."}
              </h1>
              <p>Here&apos;s what is happening across WorkBee today.</p>
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
                {mode === "live" ? "Manage Connection" : "Connect Live Data"}
              </button>
            </div>
          </section>

          {mode === "error" ? (
            <div className="notice notice--error">
              <span>
                <strong>Live Data Is Unavailable.</strong> {message} Showing the
                last loaded data.
              </span>
              <button onClick={() => setConnectionOpen(true)}>Review Connection</button>
            </div>
          ) : mode === "demo" ? (
            <div className="notice">
              <span>
                <strong>Preview Mode.</strong> Connect the WorkBee API to replace
                this realistic sample with live PostgreSQL data.
              </span>
              <button onClick={() => setConnectionOpen(true)}>Connect Now</button>
            </div>
          ) : null}

          <section className="metric-grid" aria-label="Platform summary">
            <MetricCard
              label="Total People"
              value={fullNumber.format(summary.totalUsers)}
              hint={`${fullNumber.format(summary.employees)} Employees · ${fullNumber.format(summary.employers)} Employers`}
              change={`+${summary.newUsers30d} This Month`}
              icon={Users}
              tone="blue"
            />
            <MetricCard
              label="Profile Completion"
              value={`${summary.profileCompletion.toFixed(1)}%`}
              hint="Employee and Employer Profiles"
              change="+4.2%"
              icon={CircleUserRound}
              tone="violet"
            />
            <MetricCard
              label="Document Coverage"
              value={`${summary.documentCoverage.toFixed(1)}%`}
              hint="Employees With Core Documents"
              change="+7.8%"
              icon={FileCheck2}
              tone="green"
            />
            <MetricCard
              label="Vault Balance"
              value={currency.format(summary.vaultBalance)}
              hint="Total Across All Accounts"
              icon={WalletCards}
              tone="amber"
            />
          </section>

          <section className="analytics-grid">
            <article className="panel panel--wide">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Growth</span>
                  <h2>New Registrations</h2>
                  <p>Accounts Created and Profiles Completed.</p>
                </div>
                <div className="range-switch" aria-label="Chart range">
                  <button
                    className={range === "7d" ? "is-active" : ""}
                    onClick={() => setRange("7d")}
                  >
                    7 Days
                  </button>
                  <button
                    className={range === "30d" ? "is-active" : ""}
                    onClick={() => setRange("30d")}
                  >
                    30 Days
                  </button>
                </div>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot legend-dot--blue" />Registrations</span>
                <span><i className="legend-dot legend-dot--violet" />Profiles Completed</span>
              </div>
              <div className="trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0D5BFF" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#0D5BFF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profilesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD54A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FFD54A" stopOpacity={0} />
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
                      stroke="#0D5BFF"
                      strokeWidth={2.5}
                      fill="url(#usersFill)"
                    />
                    <Area
                      dataKey="profiles"
                      name="Profiles Completed"
                      type="monotone"
                      stroke="#E0AD00"
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
                  <h2>People Mix</h2>
                  <p>Active Account Roles.</p>
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
                            fill={index === 0 ? "#0D5BFF" : "#FFD54A"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-chart__label">
                    <strong>{compactNumber.format(summary.totalUsers)}</strong>
                    <span>People</span>
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
                  <span className="panel__kicker">Worker Interests</span>
                  <h2>Top Job Categories</h2>
                </div>
                <BriefcaseBusiness size={19} className="panel__icon" />
              </div>
              <div className="rank-list">
                {data.jobCategories.map((category, index) => (
                  <div className="rank-row" key={category.name}>
                    <span className="rank-row__number">{index + 1}</span>
                    <div>
                      <div>
                        <strong>{humanizeKey(category.name)}</strong>
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
                  <h2>People by Province</h2>
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
                    <Bar dataKey="value" name="People" fill="#0D5BFF" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel operational-panel" id="documents">
              <div className="panel__header">
                <div>
                  <span className="panel__kicker">Readiness</span>
                  <h2>Profile Health</h2>
                </div>
                <Activity size={19} className="panel__icon" />
              </div>
              <div className="health-score">
                <div>
                  <strong>{summary.documentCoverage.toFixed(0)}</strong>
                  <span>/100</span>
                </div>
                <p>Platform Readiness Score</p>
              </div>
              <div className="health-items">
                <div>
                  <span><Check size={14} />Profiles Complete</span>
                  <strong>{summary.profileCompletion.toFixed(1)}%</strong>
                </div>
                <div>
                  <span><Check size={14} />Core Documents</span>
                  <strong>{summary.documentCoverage.toFixed(1)}%</strong>
                </div>
                <div id="vault">
                  <span><WalletCards size={14} />Vault Funded</span>
                  <strong>{currency.format(summary.vaultBalance)}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="panel people-panel">
            <div className="people-panel__header">
              <div>
                <span className="panel__kicker">Directory</span>
                <h2>People Directory</h2>
                <p>Select a person to inspect their profile and files.</p>
              </div>
              <div className="people-tools">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Search people by name, ID, or job preference"
                    placeholder="Name, ID or Job Preference"
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
                    <option value="all">All Roles</option>
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
                      <th>Job Preferences</th>
                      <th>Location</th>
                      <th>Profile</th>
                      <th>Files</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: RecentUser) => (
                      <tr key={user.id}>
                        <td>
                          <button
                            className="person-cell person-cell--button"
                            onClick={() => void openProfile(user)}
                            aria-label={`Open ${user.name}'s profile`}
                          >
                            <span className="avatar">{initials(user.name)}</span>
                            <div>
                              <strong>{user.name}</strong>
                              <span>{user.id}</span>
                            </div>
                            <ExternalLink size={14} />
                          </button>
                        </td>
                        <td>
                          <span className={`role-badge role-badge--${user.role}`}>
                            {titleCase(user.role)}
                          </span>
                        </td>
                        <td>
                          {user.jobPreferences.length ? (
                            <div className="table-preferences">
                              {user.jobPreferences.slice(0, 2).map((preference) => (
                                <span key={preference.key}>
                                  {humanizeKey(preference.key)}
                                </span>
                              ))}
                              {user.jobPreferences.length > 2 ? (
                                <small>+{user.jobPreferences.length - 2}</small>
                              ) : null}
                            </div>
                          ) : (
                            <span className="table-secondary">Not Selected</span>
                          )}
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
                Showing {filteredUsers.length} of {data.recentUsers.length} people
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
            <span>WorkBee Dashboard</span>
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

      {profileOpen ? (
        <ProfileDrawer
          user={selectedUser}
          loading={profileLoading}
          error={profileError}
          documentLoading={documentLoading}
          onClose={() => {
            setProfileOpen(false);
            setSelectedUser(null);
            setProfileError("");
          }}
          onOpenDocument={(document) => void openDocument(document)}
        />
      ) : null}
    </div>
  );
}
