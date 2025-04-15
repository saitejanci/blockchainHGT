// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Open default tab (Home)
document.querySelector('a[href="#home"]').click();

// Web3.js and MetaMask logic
let web3;
let contract;
const contractAddress = "0x9Daeb545ea3DEaC5d1B7EBa9E45b44fDF493B20b"; //Give contract address
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokensEarned",
                "type": "uint256"
            }
        ],
        "name": "GoalAdded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "addGoal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "resetUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getGoals",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "ipfsHash",
                        "type": "string"
                    }
                ],
                "internalType": "struct HealthGoalTracker.Goal[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getTokens",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalGoals",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalUsers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "goals",
        "outputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "tokens",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; // Replace with the ABI from Remix IDE
let adminAddress = "0xe52e257d689350359Dc39899E6d98EE8FcF5Dc5f"; // Replace with your admin account address
let connectedAccount = null;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);

        const connectButton = document.getElementById("connect-wallet");
        const disconnectButton = document.getElementById("disconnect-wallet");
        const accountDisplay = document.getElementById("account-display");
        const accountSpan = document.getElementById("account");
        const welcomeAnimation = document.getElementById("welcome-animation");
        const welcomeMessage = document.getElementById("welcome-message");
        const submitGoalButton = document.getElementById("submit-goal");
        const goalStatus = document.getElementById("goal-status");
        const tokenBalance = document.getElementById("token-balance");
        const goalsList = document.getElementById("goals-list");
        const goalsError = document.getElementById("goals-error");

        connectButton.addEventListener("click", async () => {
            try {
                console.log("Step 1: Checking if window.ethereum is available...");
                if (!window.ethereum) {
                    throw new Error("MetaMask is not installed or not detected.");
                }

                console.log("Step 2: Requesting MetaMask connection...");
                await window.ethereum.request({ method: "eth_requestAccounts" });
                console.log("MetaMask connection successful");

                console.log("Step 3: Retrieving accounts...");
                const accounts = await web3.eth.getAccounts();
                if (!accounts || accounts.length === 0) {
                    throw new Error("No accounts retrieved from MetaMask.");
                }
                connectedAccount = accounts[0];
                console.log("Connected account:", connectedAccount);
                accountSpan.textContent = connectedAccount;
                accountDisplay.style.display = "block";
                connectButton.textContent = "Connected";
                connectButton.disabled = true;
                disconnectButton.style.display = "block";

                console.log("Step 4: Checking current network...");
                const networkId = await web3.eth.net.getId();
                console.log("Current network ID:", networkId);
                const sepoliaNetworkId = 11155111; // Sepolia network ID
                if (networkId !== sepoliaNetworkId) {
                    throw new Error(`Please switch MetaMask to the Sepolia Test Network (network ID ${sepoliaNetworkId}). Current network ID: ${networkId}`);
                }

                console.log("Step 5: Checking if user is admin...");
                const isAdmin = connectedAccount.toLowerCase() === adminAddress.toLowerCase();
                console.log("Is admin:", isAdmin);

                console.log("Step 6: Updating admin section visibility...");
                const settingsTab = document.getElementById('settingsTab');
                if (isAdmin) {
                    settingsTab.style.display = 'block';
                    accountSpan.textContent += " (Admin)";
                } else {
                    settingsTab.style.display = 'none';
                }

                // Show welcome animation with personalized message
                if (welcomeAnimation && welcomeMessage) {
                    welcomeMessage.textContent = `Welcome to Your Health Journey, ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}!`;
                    welcomeAnimation.style.display = "block"; // Show the container to trigger animation
                } else {
                    console.error("Welcome animation elements not found in DOM. Ensure 'welcome-animation' and 'welcome-message' IDs exist in index.html.");
                }

                console.log("Connection completed successfully.");
            } catch (error) {
                console.error("Connection error:", error);
                alert("Connection failed: " + error.message);
            }
        });

        disconnectButton.addEventListener("click", () => {
            connectedAccount = null;
            accountSpan.textContent = "";
            accountDisplay.style.display = "none";
            connectButton.textContent = "Connect Wallet";
            connectButton.disabled = false;
            disconnectButton.style.display = "none";
            const settingsTab = document.getElementById('settingsTab');
            settingsTab.style.display = 'none';
            if (welcomeAnimation) {
                welcomeAnimation.style.display = "none";
            }
            tokenBalance.textContent = "";
            goalsList.innerHTML = "";
            goalsError.textContent = "";
            document.querySelector('a[href="#home"]').click();
        });

        // Admin functionality in the Settings tab
        const getStatsButton = document.getElementById("get-stats");
        const statsDisplay = document.getElementById("stats-display");
        const resetAddressInput = document.getElementById("reset-address");
        const resetUserButton = document.getElementById("reset-user");
        const resetStatus = document.getElementById("reset-status");

        getStatsButton.addEventListener("click", async () => {
            if (!connectedAccount) {
                statsDisplay.textContent = "Please connect your wallet first!";
                return;
            }
            try {
                statsDisplay.textContent = "Fetching statistics...";
                const totalUsers = await contract.methods.getTotalUsers().call({ from: connectedAccount });
                const totalGoals = await contract.methods.getTotalGoals().call({ from: connectedAccount });
                statsDisplay.textContent = `Total Users: ${totalUsers}, Total Goals: ${totalGoals}`;
            } catch (error) {
                console.error("Error fetching statistics:", error);
                statsDisplay.textContent = "Failed to fetch statistics: " + error.message;
            }
        });

        resetUserButton.addEventListener("click", async () => {
            if (!connectedAccount) {
                resetStatus.textContent = "Please connect your wallet first!";
                return;
            }
            const userAddress = resetAddressInput.value.trim();
            if (!web3.utils.isAddress(userAddress)) {
                resetStatus.textContent = "Please enter a valid Ethereum address!";
                return;
            }
            try {
                resetStatus.textContent = "Resetting user...";
                await contract.methods.resetUser(userAddress).send({ from: connectedAccount });
                resetStatus.textContent = `User ${userAddress} reset successfully!`;
                resetAddressInput.value = "";
            } catch (error) {
                console.error("Error resetting user:", error);
                resetStatus.textContent = "Failed to reset user: " + error.message;
            }
        });

        // Add goal
        submitGoalButton.addEventListener("click", async () => {
            if (!connectedAccount) {
                goalStatus.textContent = "Please connect your wallet first!";
                return;
            }
            const description = document.getElementById("goal-description").value;
            const note = document.getElementById("goal-note").value || "";
            const ipfsHashInput = document.getElementById("goal-ipfs-hash");
            if (!description) {
                goalStatus.textContent = "Please enter a goal description!";
                return;
            }
            try {
                goalStatus.textContent = "Uploading note to IPFS...";
                let ipfsHash = "";
                if (note) {
                    console.log("Sending note to backend:", note);
                    const response = await fetch('/api/upload-note', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ note })
                    });
                    const data = await response.json();
                    console.log("Backend response:", data);
                    if (data.error) {
                        console.log("Error from backend:", data.error);
                        throw new Error(data.error);
                    }
                    ipfsHash = data.ipfsHash;
                    console.log("Received IPFS hash:", ipfsHash);
                    ipfsHashInput.value = ipfsHash || "Failed to get IPFS hash";
                } else {
                    console.log("No note provided, proceeding without IPFS hash");
                    ipfsHashInput.value = "";
                }
                goalStatus.textContent = "Adding goal...";
                console.log("Calling addGoal with description:", description, "and IPFS hash:", ipfsHash);
                await contract.methods.addGoal(description, ipfsHash).send({ from: connectedAccount });
                goalStatus.textContent = "Goal added successfully!";
                document.getElementById("goal-description").value = "";
                document.getElementById("goal-note").value = "";
                ipfsHashInput.value = "";
            } catch (error) {
                console.error("Error adding goal:", error);
                goalStatus.textContent = "Failed to add goal: " + error.message;
            }
        });

        // View goals and tokens when "My Goals" tab is opened
        document.querySelector('a[href="#my-goals"]').addEventListener("click", async () => {
            if (!connectedAccount) {
                goalsError.textContent = "Please connect your wallet to view your goals!";
                tokenBalance.textContent = "";
                goalsList.innerHTML = "";
                return;
            }
            try {
                goalsError.textContent = "";
                const response = await fetch(`/api/get-goals-and-tokens/${connectedAccount}`);
                const data = await response.json();
                console.log("Fetched goals and tokens:", data);
                if (data.error) {
                    console.log("Error fetching goals:", data.error);
                    throw new Error(data.error);
                }
                tokenBalance.textContent = `Token Balance: ${data.tokens}`;
                goalsList.innerHTML = "";
                if (data.goals.length === 0) {
                    goalsList.innerHTML = "<li>No goals yet.</li>";
                } else {
                    data.goals.forEach(goal => {
                        const li = document.createElement("li");
                        li.textContent = `${goal.description}${goal.ipfsHash ? ` (IPFS: ${goal.ipfsHash})` : ""}`;
                        goalsList.appendChild(li);
                    });
                }
            } catch (error) {
                console.error("Error fetching goals:", error);
                goalsError.textContent = "Failed to load goals: " + error.message;
                tokenBalance.textContent = "";
                goalsList.innerHTML = "";
            }
        });

        // Health Insights tab - Random health tips/fun facts
        const healthTips = [
            "Did you know walking 10,000 steps burns around 500 calories?",
            "Drinking 8 glasses of water a day keeps your body hydrated and energized!",
            "Fun Fact: Laughing for 10 minutes can burn up to 40 calories!",
            "A 30-minute jog can boost your mood for the whole day!",
            "Eating leafy greens like spinach can improve your heart health!",
            "Did you know stretching daily can reduce stress and improve flexibility?",
            "Fun Fact: Dancing for 30 minutes can burn up to 200 calories!"
        ];
        const healthTipText = document.getElementById("health-tip-text");
        const refreshTipButton = document.getElementById("refresh-tip");

        function showRandomTip() {
            const randomIndex = Math.floor(Math.random() * healthTips.length);
            healthTipText.textContent = healthTips[randomIndex];
        }

        // Show a random tip on page load
        showRandomTip();

        refreshTipButton.addEventListener("click", showRandomTip);
    } else {
        alert('Please install MetaMask!');
    }
});