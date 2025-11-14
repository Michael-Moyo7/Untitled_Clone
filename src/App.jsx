import React from "react";
import "./App.css";

const VIEWS = {
  projects: "projects",
  library: "library",
};

const STORAGE_KEY = "simple-audio-library";
const USER_STORAGE_KEY = "simple-audio-user";
const DEFAULT_OWNER_NAME = "Youfoundmikey";
const GRADIENTS = [
  "linear-gradient(135deg, #5b7cfa, #9c4df4)",
  "linear-gradient(135deg, #ff6a88, #ff99ac)",
  "linear-gradient(135deg, #45f79a, #00c4a1)",
  "linear-gradient(135deg, #ffd36f, #ff8a57)",
  "linear-gradient(135deg, #76a7ff, #a873ff)",
  "linear-gradient(135deg, #ffcfe4, #b0f3ff)",
];

const generateId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ensureProjectShape = (project, index) => ({
  ...project,
  owner: project.owner || DEFAULT_OWNER_NAME,
  coverGradient: project.coverGradient || GRADIENTS[index % GRADIENTS.length],
  tracks: Array.isArray(project.tracks) ? project.tracks : [],
});

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return "0m 00s";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}m ${remaining.toString().padStart(2, "0")}s`;
};

const formatTrackDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatTrackDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const readAudioDuration = (url) =>
  new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = url;
    const handleLoaded = () => {
      resolve(audio.duration || 0);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("error", handleError);
    };
    const handleError = () => {
      resolve(0);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("error", handleError);
    };
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("error", handleError);
  });

function IconButton({ label, children, onClick, variant = "surface", disabled }) {
  return (
    <button
      type="button"
      className={`icon-button icon-button--${variant}`}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M15.5 19.5 8 12l7.5-7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="m9 7 8 5-8 5V7Z"
      fill="currentColor"
    />
  </svg>
);

const ShuffleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M4 4h3l12 12m0 0h-3m3 0v-3M4 20h3l4-4m9-9h-3m3 0v3M11 13 8 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M10.59 13.41a2 2 0 0 0 2.82 0l3.59-3.59a2 2 0 0 0-2.82-2.82L12 7.59M13.41 10.59 9.82 14.18a2 2 0 1 0 2.82 2.82L15 14.64"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Zm-6 5a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export default function App() {
  const [currentView, setCurrentView] = React.useState(VIEWS.projects);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState(null);
  const [uploadError, setUploadError] = React.useState("");
  const [isProcessingTrack, setIsProcessingTrack] = React.useState(false);
  const [accountName, setAccountName] = React.useState("");
  const [accountEmail, setAccountEmail] = React.useState("");
  const [accountError, setAccountError] = React.useState("");
  const fileInputRef = React.useRef(null);
  const [user, setUser] = React.useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.email || !parsed.name) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = React.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.projects)) return [];
      return parsed.projects.map((project, index) => ensureProjectShape(project, index));
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const serialised = JSON.stringify({ projects });
    window.localStorage.setItem(STORAGE_KEY, serialised);
  }, [projects]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const totalDuration = selectedProject
    ? selectedProject.tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
    : 0;

  const handleCreateProject = (event) => {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    const project = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      owner: user?.name || DEFAULT_OWNER_NAME,
      coverGradient: GRADIENTS[projects.length % GRADIENTS.length],
      tracks: [],
    };

    setProjects((prev) => [...prev, project]);
    setNewProjectName("");
  };

  const handleDeleteProject = (projectId) => {
    if (!window.confirm("Delete this project and its tracks?")) return;

    const projectToDelete = projects.find((project) => project.id === projectId);
    if (projectToDelete) {
      projectToDelete.tracks.forEach((track) => {
        if (track.fileUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(track.fileUrl);
        }
      });
    }

    setProjects((prev) => prev.filter((project) => project.id !== projectId));

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setCurrentView(VIEWS.projects);
      setUploadError("");
      setIsProcessingTrack(false);
    }
  };

  const openProject = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView(VIEWS.library);
    setUploadError("");
    setIsProcessingTrack(false);
  };

  const goBackToProjects = () => {
    setCurrentView(VIEWS.projects);
    setSelectedProjectId(null);
    setUploadError("");
    setIsProcessingTrack(false);
  };

  const handleAddTrackClick = () => {
    if (!selectedProjectId) {
      setUploadError("Open a project before adding tracks.");
      return;
    }
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleTrackFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file || !selectedProjectId) return;

    setIsProcessingTrack(true);
    setUploadError("");

    const fileUrl = URL.createObjectURL(file);
    try {
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "") || "Untitled track";
      const titlePrompt = window.prompt("Track title", defaultTitle);
      if (titlePrompt === null) {
        URL.revokeObjectURL(fileUrl);
        setIsProcessingTrack(false);
        return;
      }

      const duration = await readAudioDuration(fileUrl);

      const track = {
        id: generateId(),
        title: titlePrompt.trim() || defaultTitle,
        fileUrl,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        duration,
      };

      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProjectId
            ? { ...project, tracks: [...project.tracks, track] }
            : project
        )
      );
    } catch (error) {
      console.error(error);
      URL.revokeObjectURL(fileUrl);
      setUploadError("Something went wrong while adding the track.");
    } finally {
      setIsProcessingTrack(false);
    }
  };

  const handleDeleteTrack = (projectId, trackId) => {
    if (!window.confirm("Delete this track?")) return;

    const project = projects.find((item) => item.id === projectId);
    const track = project?.tracks.find((item) => item.id === trackId);
    if (track?.fileUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(track.fileUrl);
    }

    setProjects((prev) =>
      prev.map((projectItem) =>
        projectItem.id === projectId
          ? {
              ...projectItem,
              tracks: projectItem.tracks.filter((item) => item.id !== trackId),
            }
          : projectItem
      )
    );
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    const trimmedName = accountName.trim();
    const trimmedEmail = accountEmail.trim().toLowerCase();
    if (!trimmedName) {
      setAccountError("Add your name to continue.");
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isValidEmail) {
      setAccountError("Enter a valid email address.");
      return;
    }
    if (
      !trimmedEmail.endsWith("@gmail.com") &&
      !trimmedEmail.endsWith("@googlemail.com")
    ) {
      setAccountError("Use a Google (Gmail) email address to create an account.");
      return;
    }
    setUser({
      id: generateId(),
      name: trimmedName,
      email: trimmedEmail,
    });
    setAccountName("");
    setAccountEmail("");
    setAccountError("");
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentView(VIEWS.projects);
    setSelectedProjectId(null);
    setUploadError("");
    setIsProcessingTrack(false);
  };

  if (!user) {
    return (
      <div className="app">
        <header className="top-bar">
          <div className="brand">
            <span className="brand__title">[untitled]</span>
          </div>
        </header>
        <main className="app-content">
          <section className="account-view">
            <div className="account-panel">
              <p className="account-eyebrow">Welcome</p>
              <h1>Create your account</h1>
              <p className="account-copy">
                Use your Google email to keep your mixtapes synced on this device.
              </p>
              <form className="account-form" onSubmit={handleAccountSubmit}>
                <label className="account-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    placeholder="Taylor Creator"
                    autoComplete="name"
                  />
                </label>
                <label className="account-field">
                  <span>Google email</span>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(event) => setAccountEmail(event.target.value)}
                    placeholder="taylor.creator@gmail.com"
                    autoComplete="email"
                  />
                </label>
                {accountError && <p className="status error">{accountError}</p>}
                <button type="submit" className="account-submit">
                  Create account
                </button>
              </form>
              <p className="account-hint">
                Tip: use the Gmail address tied to your Google account. You can switch later.
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <span className="brand__title">[untitled]</span>
        </div>
        <div className="top-actions">
          <IconButton label="Notifications">
            <BellIcon />
          </IconButton>
          <IconButton label="Search">
            <SearchIcon />
          </IconButton>
          <div className="user-chip">
            <span className="user-chip__avatar">{getInitials(user.name)}</span>
            <div className="user-chip__info">
              <span className="user-chip__name">{user.name}</span>
              <span className="user-chip__email">{user.email}</span>
            </div>
            <button type="button" className="user-chip__action" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">
        {currentView === VIEWS.projects && (
          <section className="projects-view">
            <div className="projects-grid">
              {projects.map((project) => (
                <article key={project.id} className="project-card">
                  <button
                    type="button"
                    className="project-card__cover"
                    style={{ backgroundImage: project.coverGradient }}
                    onClick={() => openProject(project.id)}
                  >
                    <span className="project-card__play">
                      <PlayIcon />
                    </span>
                  </button>
                  <div className="project-card__body">
                    <div>
                      <h3 className="project-card__title">
                        {project.name || "Untitled project"}
                      </h3>
                      <p className="project-card__meta">
                        <span className="project-card__meta-item">{project.owner}</span>
                        <span className="project-card__meta-item">
                          {project.tracks.length} track
                          {project.tracks.length === 1 ? "" : "s"}
                        </span>
                      </p>
                    </div>
                    <IconButton
                      label="Project options"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </div>
                </article>
              ))}
            </div>

            {projects.length === 0 && (
              <p className="empty-state">Add your first project to get started.</p>
            )}

            <form className="create-project" onSubmit={handleCreateProject}>
              <input
                type="text"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="Project name"
              />
              <button type="submit" className="create-project__button">
                <PlusIcon />
                <span>Add</span>
              </button>
            </form>
          </section>
        )}

        {currentView === VIEWS.library && selectedProject && (
          <section className="library-view">
            <div className="detail-toolbar">
              <IconButton label="Back" onClick={goBackToProjects} variant="ghost">
                <ArrowLeftIcon />
              </IconButton>
              <div className="detail-toolbar__actions">
                <IconButton label="Copy link" variant="surface">
                  <LinkIcon />
                </IconButton>
                <IconButton label="Search tracks" variant="surface">
                  <SearchIcon />
                </IconButton>
                <IconButton label="More" variant="surface">
                  <MoreIcon />
                </IconButton>
              </div>
            </div>

            <div className="detail-layout">
              <div
                className="detail-cover"
                style={{ backgroundImage: selectedProject.coverGradient }}
              />

              <div className="detail-panel">
                <div className="detail-heading">
                  <div>
                    <h1 className="detail-title">
                      {selectedProject.name || "Untitled project"}
                    </h1>
                    <p className="detail-meta">
                      <span>{selectedProject.owner}</span>
                      <span>•</span>
                      <span>
                        {selectedProject.tracks.length} track
                        {selectedProject.tracks.length === 1 ? "" : "s"}
                      </span>
                      <span>•</span>
                      <span>{formatDuration(totalDuration)}</span>
                    </p>
                  </div>
                  <div className="detail-heading__buttons">
                    <IconButton label="Shuffle">
                      <ShuffleIcon />
                    </IconButton>
                    <IconButton label="Play" variant="primary">
                      <PlayIcon />
                    </IconButton>
                  </div>
                </div>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="add-track-button"
                    onClick={handleAddTrackClick}
                    disabled={isProcessingTrack}
                  >
                    <PlusIcon />
                    <span>{isProcessingTrack ? "Processing..." : "Add tracks"}</span>
                  </button>
                  <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    className="hidden-input"
                    onChange={handleTrackFileChange}
                  />
                </div>
                {uploadError && <p className="status error">{uploadError}</p>}

                {selectedProject.tracks.length === 0 ? (
                  <p className="empty-state">No tracks here yet — add one to start listening.</p>
                ) : (
                  <ol className="track-list">
                    {selectedProject.tracks.map((track, index) => (
                      <li key={track.id} className="track-row">
                        <span className="track-row__index">{index + 1}</span>
                        <div className="track-row__body">
                          <p className="track-row__title">{track.title || "Untitled track"}</p>
                          <p className="track-row__meta">
                            {formatTrackDate(track.createdAt)} • {formatTrackDateTime(track.createdAt)}
                          </p>
                        </div>
                        <div className="track-row__actions">
                          <span className="track-row__duration">
                            {formatDuration(track.duration)}
                          </span>
                          <IconButton
                            label="Track options"
                            onClick={() => handleDeleteTrack(selectedProject.id, track.id)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </div>
                        <audio className="track-row__player" controls src={track.fileUrl}>
                          Your browser does not support audio playback.
                        </audio>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
