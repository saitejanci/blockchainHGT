const express = require('express');
const { Web3 } = require('web3');
const { PinataSDK } = require('pinata-web3');
const cors = require('cors'); // Add CORS middleware
const app = express();

// Use PORT from environment variable (for Elastic Beanstalk) or default to 3000 locally
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS to allow cross-origin requests (useful for deployed app)
app.use(cors());

// Serve static files from the root directory
app.use(express.static('.'));

// Connect to Sepolia testnet via Infura
const infuraUrl = 'https://sepolia.infura.io/v3/14561ee878d2402db3d378bf1aafd472';
console.log("Connecting to Infura with URL:", infuraUrl);
const web3 = new Web3(infuraUrl);

// Test Web3 connection
web3.eth.net.isListening()
    .then(() => console.log("Successfully connected to Sepolia testnet via Infura"))
    .catch(err => console.error("Failed to connect to Sepolia testnet:", err));

// Smart contract details
const contractAddress = "0x9Daeb545ea3DEaC5d1B7EBa9E45b44fDF493B20b";
console.log("Using contract address:", contractAddress);
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
];

let contract;
try {
    contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("Contract instance created successfully");
} catch (error) {
    console.error("Failed to create contract instance:", error);
}

// Pinata setup (using the public Pinata gateway; replace pinataGateway with your dedicated gateway if you have one)
const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZjAxZDIxNi1iN2IwLTRkN2MtYTNjOS03NGE3ZTliNzFhOTAiLCJlbWFpbCI6ImlyZXNhaXRlamFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImFhZWY0YzFlMzdmNWM4YTc4NzA2Iiwic2NvcGVkS2V5U2VjcmV0IjoiNWM3Njg2ZDUwODU1MmRjMjNhMWUyMWE3MmU2MDBhZDZkODM4NDdmN2UxZmYyOTY0OTk3Y2M0NDJlMGNkZTRkOSIsImV4cCI6MTc3NjAxNTI2M30.ZUkNHHtyFTNZIpWoTMmY3DGnbEi4CZjcBWBw7-fNwmI",
    pinataGateway: "https://gateway.pinata.cloud"
});

// API to get goals and tokens for a user
app.get('/api/get-goals-and-tokens/:address', async (req, res) => {
    try {
        const address = req.params.address;
        console.log(`Fetching goals and tokens for address: ${address}`);
        const goals = await contract.methods.getGoals(address).call();
        console.log("Goals fetched:", goals);
        const tokens = await contract.methods.getTokens(address).call();
        console.log("Tokens fetched (raw):", tokens);

        // Convert BigInt to string for JSON serialization
        const tokensAsString = tokens.toString();
        console.log("Tokens converted to string:", tokensAsString);

        res.json({ goals, tokens: tokensAsString });
    } catch (error) {
        console.error("Error fetching goals and tokens:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to fetch goals and tokens", details: error.message });
    }
});

// API to upload note to IPFS and return the hash
app.post('/api/upload-note', async (req, res) => {
    try {
        const { note } = req.body;
        console.log("Received note for upload:", note);
        if (!note) {
            console.log("No note provided, returning error");
            return res.status(400).json({ error: "Note is required" });
        }
        console.log("Uploading note to IPFS via Pinata...");
        const result = await pinata.upload.json({ note });
        console.log("Upload result:", result);
        if (!result || !result.IpfsHash) {
            console.log("No IPFS hash returned, returning error");
            throw new Error("Failed to get IPFS hash from Pinata");
        }
        console.log("Note uploaded to IPFS successfully, hash:", result.IpfsHash);
        res.json({ ipfsHash: result.IpfsHash });
    } catch (error) {
        console.error("Error uploading note to IPFS:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to upload note to IPFS", details: error.message });
    }
});

// Fallback route for 404 errors
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});