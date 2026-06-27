// Configuration matching the target GitHub deployment
const GITHUB_USER = "javas-afraid";
const REPO_NAME = "Aether-Launcher";

document.getElementById("download-btn").addEventListener("click", packageLauncherDeployment);

async function packageLauncherDeployment(event) {
    event.preventDefault();
    
    const selectedVersion = document.getElementById("version-input").value.trim();
    const downloadBtn = document.getElementById("download-btn");
    
    if (!selectedVersion) {
        alert("Please enter or select a target version string first.");
        return;
    }

    downloadBtn.innerText = "Processing Package...";

    try {
        // 1. Fetch the latest pre-compiled launcher binary from GitHub Releases
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/releases/latest`);
        const data = await response.json();
        
        // Target either the executable (.exe) or multi-platform container (.jar) 
        const binaryAsset = data.assets.find(asset => asset.name.endsWith('.exe') || asset.name.endsWith('.jar'));
        
        if (!binaryAsset) throw new Error("No compiled runtime asset discovered in release history.");

        // 2. Stream the binary directly into the client browser session
        const binaryResponse = await fetch(binaryAsset.browser_download_url);
        const binaryBlob = await binaryResponse.blob();

        // 3. Initiate client-side download for the Launcher core binary
        const binaryLink = document.createElement("a");
        binaryLink.href = URL.createObjectURL(binaryBlob);
        binaryLink.download = binaryAsset.name;
        document.body.appendChild(binaryLink);
        binaryLink.click();
        document.body.removeChild(binaryLink);

        // 4. Generate the unverified text payload containing the version configuration
        const configPayload = JSON.stringify({ targetVersion: selectedVersion }, null, 2);
        const configBlob = new Blob([configPayload], { type: "application/json" });
        
        const configLink = document.createElement("a");
        configLink.href = URL.createObjectURL(configBlob);
        configLink.download = "launcher_config.json"; // Saved to the user's local directory next to the binary
        document.body.appendChild(configLink);
        configLink.click();
        document.body.removeChild(configLink);

        downloadBtn.innerText = "Download Ready!";
    } catch (error) {
        console.error("Pipeline breakdown:", error);
        downloadBtn.innerText = "Deployment Interrupted";
    }
}
