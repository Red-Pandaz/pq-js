// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tetration-lab/dilithium-solidity/contracts/Dilithium.sol";

contract PQKeyRegistry {
    struct Registration {
        string email;           // Optional: can be empty
        bytes kemPublicKey;     // ML-KEM-512: 800 bytes
        bytes signaturePublicKey; // Dilithium2: 1,312 bytes
        bytes signature;        // Dilithium2 signature of registration data
        uint256 timestamp;
        bool isActive;
        bool hasEmailVerification; // Flag indicating if email was verified
        uint256 emailUpdateCount; // Track email changes
    }
    
    mapping(address => Registration) public registries;
    mapping(string => address) public emailToAddress;
    mapping(address => bytes32) public intentHashes;
    mapping(address => bytes32) public emailUpdateIntents; // For email updates
    
    event IntentSubmitted(address indexed user, string email, bytes32 intentHash, bool hasEmailVerification);
    event KeyRegistered(address indexed user, string email, uint256 timestamp, bool hasEmailVerification);
    event EmailUpdateIntent(address indexed user, string newEmail, bytes32 intentHash);
    event EmailUpdated(address indexed user, string oldEmail, string newEmail, uint256 timestamp);
    event KeysUpdated(address indexed user, uint256 timestamp);
    
    function submitIntent(
        string memory email,           // Can be empty
        bytes memory kemPublicKey,
        bytes memory signaturePublicKey,
        bytes memory signature,        // Dilithium2 signature
        bytes memory decryptedSalt     // Can be empty if no email verification
    ) external {
        require(intentHashes[msg.sender] == bytes32(0), "Intent already exists");
        
        // Email verification is optional
        bool hasEmailVerification = bytes(decryptedSalt).length > 0;
        
        if (hasEmailVerification) {
            require(emailToAddress[email] == address(0), "Email already registered");
            require(bytes(email).length > 0, "Email required for verification");
        }
        
        // Verify Dilithium2 signature on-chain!
        bytes32 messageHash = keccak256(abi.encodePacked(
            decryptedSalt,
            email,
            kemPublicKey,
            signaturePublicKey,
            msg.sender
        ));
        
        bool isValid = Dilithium.verify(
            messageHash,
            signature,
            signaturePublicKey
        );
        require(isValid, "Invalid Dilithium2 signature");
        
        // Create intent hash
        bytes32 intentHash = keccak256(abi.encodePacked(
            decryptedSalt,
            email,
            kemPublicKey,
            signaturePublicKey,
            signature,
            msg.sender
        ));
        
        intentHashes[msg.sender] = intentHash;
        
        emit IntentSubmitted(msg.sender, email, intentHash, hasEmailVerification);
    }
    
    function verifyAndRegister(
        string memory email,
        bytes memory kemPublicKey,
        bytes memory signaturePublicKey,
        bytes memory signature,
        bytes memory decryptedSalt,
        bytes32 intentHash
    ) external {
        bool hasEmailVerification = bytes(decryptedSalt).length > 0;
        
        if (hasEmailVerification) {
            require(emailToAddress[email] == address(0), "Email already registered");
            require(bytes(email).length > 0, "Email required for verification");
        }
        
        // Verify intent hash matches
        bytes32 expectedHash = keccak256(abi.encodePacked(
            decryptedSalt,
            email,
            kemPublicKey,
            signaturePublicKey,
            signature,
            msg.sender
        ));
        require(intentHashes[msg.sender] == expectedHash, "Hash mismatch");
        
        // Register the keys
        registries[msg.sender] = Registration({
            email: email,
            kemPublicKey: kemPublicKey,
            signaturePublicKey: signaturePublicKey,
            signature: signature,
            timestamp: block.timestamp,
            isActive: true,
            hasEmailVerification: hasEmailVerification,
            emailUpdateCount: 0
        });
        
        if (hasEmailVerification) {
            emailToAddress[email] = msg.sender;
        }
        
        delete intentHashes[msg.sender];
        
        emit KeyRegistered(msg.sender, email, block.timestamp, hasEmailVerification);
    }
    
    // Public verification function - anyone can verify an intent
    function verifyIntent(
        address user,
        string memory email,
        bytes memory kemPublicKey,
        bytes memory signaturePublicKey,
        bytes memory signature,
        bytes memory decryptedSalt
    ) external view returns (bool) {
        bytes32 expectedHash = keccak256(abi.encodePacked(
            decryptedSalt,
            email,
            kemPublicKey,
            signaturePublicKey,
            signature,
            user
        ));
        return intentHashes[user] == expectedHash;
    }
    
    function registerKeysBasic(
        bytes memory kemPublicKey,
        bytes memory signaturePublicKey,
        bytes memory signature
    ) external {
        require(registries[msg.sender].timestamp == 0, "Already registered");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            kemPublicKey, signaturePublicKey, msg.sender
        ));
        
        bool isValid = Dilithium.verify(messageHash, signature, signaturePublicKey);
        require(isValid, "Invalid signature");
        
        registries[msg.sender] = Registration({
            email: "",
            kemPublicKey: kemPublicKey,
            signaturePublicKey: signaturePublicKey,
            signature: signature,
            timestamp: block.timestamp,
            isActive: true,
            hasEmailVerification: false,
            emailUpdateCount: 0
        });
        
        emit KeyRegistered(msg.sender, "", block.timestamp, false);
    }
    
    function addEmailVerification(
        string memory email,
        bytes memory decryptedSalt
    ) external {
        require(registries[msg.sender].timestamp != 0, "Not registered");
        require(emailToAddress[email] == address(0), "Email already registered");
        
        // Verify salt proves email ownership
        bytes32 emailHash = keccak256(abi.encodePacked(
            decryptedSalt, email, msg.sender
        ));
        require(intentHashes[msg.sender] == emailHash, "Invalid email verification");
        
        registries[msg.sender].email = email;
        registries[msg.sender].hasEmailVerification = true;
        emailToAddress[email] = msg.sender;
    }
    
    // Submit intent to update email
    function submitEmailUpdateIntent(
        string memory newEmail,
        bytes memory decryptedSalt
    ) external {
        require(registries[msg.sender].timestamp != 0, "Not registered");
        require(emailToAddress[newEmail] == address(0), "Email already registered");
        require(bytes(newEmail).length > 0, "Email cannot be empty");
        
        // Create intent hash for email update
        bytes32 intentHash = keccak256(abi.encodePacked(
            decryptedSalt, newEmail, msg.sender, "email_update"
        ));
        
        emailUpdateIntents[msg.sender] = intentHash;
        
        emit EmailUpdateIntent(msg.sender, newEmail, intentHash);
    }
    
    // Verify and complete email update
    function verifyAndUpdateEmail(
        string memory newEmail,
        bytes memory decryptedSalt
    ) external {
        require(registries[msg.sender].timestamp != 0, "Not registered");
        require(emailToAddress[newEmail] == address(0), "Email already registered");
        
        // Verify intent hash
        bytes32 expectedHash = keccak256(abi.encodePacked(
            decryptedSalt, newEmail, msg.sender, "email_update"
        ));
        require(emailUpdateIntents[msg.sender] == expectedHash, "Invalid email update intent");
        
        // Remove old email mapping
        string memory oldEmail = registries[msg.sender].email;
        if (bytes(oldEmail).length > 0) {
            delete emailToAddress[oldEmail];
        }
        
        // Update email
        registries[msg.sender].email = newEmail;
        registries[msg.sender].emailUpdateCount++;
        emailToAddress[newEmail] = msg.sender;
        
        // Clear intent
        delete emailUpdateIntents[msg.sender];
        
        emit EmailUpdated(msg.sender, oldEmail, newEmail, block.timestamp);
    }
    
    // Update keys (requires new signature)
    function updateKeys(
        bytes memory kemPublicKey,
        bytes memory signaturePublicKey,
        bytes memory signature
    ) external {
        require(registries[msg.sender].timestamp != 0, "Not registered");
        
        // Verify the update signature
        bytes32 updateHash = keccak256(abi.encodePacked(
            kemPublicKey, signaturePublicKey, msg.sender, "key_update"
        ));
        
        bool isValid = Dilithium.verify(updateHash, signature, signaturePublicKey);
        require(isValid, "Invalid update signature");
        
        registries[msg.sender].kemPublicKey = kemPublicKey;
        registries[msg.sender].signaturePublicKey = signaturePublicKey;
        registries[msg.sender].signature = signature;
        registries[msg.sender].timestamp = block.timestamp;
        
        emit KeysUpdated(msg.sender, block.timestamp);
    }
    
    // Remove email (make it unverified)
    function removeEmail() external {
        require(registries[msg.sender].timestamp != 0, "Not registered");
        require(bytes(registries[msg.sender].email).length > 0, "No email to remove");
        
        string memory oldEmail = registries[msg.sender].email;
        delete emailToAddress[oldEmail];
        
        registries[msg.sender].email = "";
        registries[msg.sender].hasEmailVerification = false;
        
        emit EmailUpdated(msg.sender, oldEmail, "", block.timestamp);
    }
    
    function getKeys(address user) external view returns (Registration memory) {
        return registries[user];
    }
    
    function getKeysByEmail(string memory email) external view returns (Registration memory) {
        address user = emailToAddress[email];
        require(user != address(0), "Email not found");
        return registries[user];
    }
    
    // Check if email update intent exists
    function getEmailUpdateIntent(address user) external view returns (bytes32) {
        return emailUpdateIntents[user];
    }
} 