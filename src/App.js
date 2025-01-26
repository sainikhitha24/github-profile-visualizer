import { useState } from "react";
import "./App.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function App() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const fetchGithubProfile = async () => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user data
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`
      );
      if (!userResponse.ok) throw new Error("User not found");
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
      );
      const reposData = await reposResponse.json();
      setRepos(reposData);

      // Calculate language statistics
      const languageStats = {};
      await Promise.all(
        reposData.map(async (repo) => {
          if (repo.language) {
            languageStats[repo.language] =
              (languageStats[repo.language] || 0) + 1;
          }
        })
      );
      setLanguages(languageStats);
    } catch (err) {
      setError(err.message);
      setUserData(null);
      setRepos([]);
      setLanguages({});
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const prepareChartData = () => {
    return Object.entries(languages).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Profile Visualizer</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchGithubProfile()}
          />
          <button onClick={fetchGithubProfile}>Search</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {userData && (
          <div className="profile-container">
            <div className="profile-header">
              <img
                src={userData.avatar_url}
                alt="Profile"
                className="profile-image"
              />
              <div className="profile-info">
                <h2>{userData.name || userData.login}</h2>
                <p className="username">@{userData.login}</p>
                <p>{userData.bio}</p>
                <p>
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {userData.location || "Not specified"}
                </p>
                <div className="stats">
                  <div>
                    <strong>Followers:</strong> {userData.followers}
                  </div>
                  <div>
                    <strong>Following:</strong> {userData.following}
                  </div>
                  <div>
                    <strong>Public Repos:</strong> {userData.public_repos}
                  </div>
                </div>
              </div>
            </div>

            {/* Language Statistics */}
            {Object.keys(languages).length > 0 && (
              <div className="languages-section">
                <h3>Language Statistics</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareChartData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {prepareChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Repository List */}
            <div className="repos-section">
              <h3>Latest Repositories</h3>
              <div className="repos-grid">
                {repos.slice(0, 6).map((repo) => (
                  <div key={repo.id} className="repo-card">
                    <h4>{repo.name}</h4>
                    <p>{repo.description || "No description available"}</p>
                    <div className="repo-stats">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🔄 {repo.forks_count}</span>
                      <span>{repo.language}</span>
                    </div>
                    <p className="repo-updated">
                      Updated: {formatDate(repo.updated_at)}
                    </p>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      View Repository
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={userData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-link"
            >
              View Full Profile
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
