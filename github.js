const GITHUB_USERNAME = "gianloco04";  // Replace with your GitHub username
const GITHUB_TOKEN = "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";        // Replace with your personal access token
const REPO_OWNER = "gianloco04";       // Replace with the repo owner
const REPO_NAME = "xyz_project";            // Replace with your repository name

async function fetchGitHubFiles() {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`, {
            headers: {
                "Authorization": `Basic ${btoa(GITHUB_USERNAME + ":" + GITHUB_TOKEN)}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch files");
        const files = await response.json();
        
        // Fetch commit data for each file to get last modified date
        const fileDataPromises = files
            .filter(file => file.type === "file") // Only include actual files
            .map(async (file) => {
                const lastModified = await fetchLastModifiedDate(file.path);
                return { name: file.name, url: file.html_url, lastModified };
            });

        const fileData = await Promise.all(fileDataPromises);
        displayFiles(fileData);
    } catch (error) {
        console.error("Error fetching GitHub files:", error);
    }
}

// Fetch the last modified date for a file using GitHub commits API
async function fetchLastModifiedDate(filePath) {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${filePath}&per_page=1`, {
            headers: {
                "Authorization": `Basic ${btoa(GITHUB_USERNAME + ":" + GITHUB_TOKEN)}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch commit data");
        const commits = await response.json();

        return commits.length > 0 ? new Date(commits[0].commit.committer.date).toLocaleString() : "Unknown";
    } catch (error) {
        console.error(`Error fetching last modified date for ${filePath}:`, error);
        return "Unknown";
    }
}

function displayFiles(files) {
    const tableBody = document.querySelector("#github-files tbody");
    tableBody.innerHTML = ""; // Clear previous content

    files.forEach(file => {
        const row = document.createElement("tr");
        row.style.cursor = "pointer";

        row.innerHTML = `
            <td>${file.name}</td>
            <td>${file.lastModified}</td>
        `;

        row.addEventListener("click", () => {
            window.open(file.url, "_blank");
        });

        tableBody.appendChild(row);
    });
}

// Run the function when the page loads
fetchGitHubFiles();
