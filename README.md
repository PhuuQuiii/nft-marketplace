### 2. Install Dependencies:
```
$ cd nft_marketplace
$ npm install
```
```

```

### 5. Migrate Smart Contracts( contracts đã được deploy)
`truffle exec src/backend/scripts/deploy.js --network localhost`

### 6. Run Tests
`$ npx truffle test`

### 7. Launch Frontend
`$ npm run start`

### cd Backend
cd src/backend/api


# Lệnh IPFS trên Docker
PS C:\Users\ASUS> docker exec -it nft_marketplace ipfs pin ls
>> 
QmVenbkcN2gjCNrt9wRLsTQc68CS3szFKrs5zgyg6xMr74 recursive
QmWw2wGZxCYNXXotSWuPkgQNWJKTrjn1XejNsKBKfqTcvt recursive
QmaeDGvBJ6w1Q8KjqbybmFfQnFKcejHHRgHXSVfm1aFx9k indirect
QmQgxHHKqgDEuC3JMauZs5Tc1wyTkpQjjsqoG1o35vnLRd recursive
QmQyDAoWMfPcPkHZ9Uv4W3YtjR6c1FjPgYCweTJgnPDhaC recursive
QmUHpKGk3Q5HG6pjMSu8MagfDDbswcwbamE5Umo8KLA5rn recursive
QmZkcWuQ8E7tqvZbYDTXjJUEyPATC1iNjkNUuMXyHtGMCi recursive
QmWYan7dbMi9Tm3K7jXfhmS1uth9akHWFKqfyojYyp3Par recursive
QmYPAVApXmhCiiY4o1XiZvRJ2JfMzhHYdZgZLFMgAH8sn8 recursive
QmYxZ6bscgkGPE1LBdzNNPHJXUGreY2LaxbK8Z6cyWuFwA recursive
QmWbpsYjyqg4VTjWa6LGU11aTgwzTri6QyU6NXdSZP13C5 recursive
Qmb8kWPcZ3HTDmjWt8jwbMuwNhtsDT2hKvd8hMj1FVDbAe recursive
QmTJRU9J2MnArQbEpGBrG94FmWm9Tbvie7Urv4NADwq3pS recursive
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn recursive
QmcoNtu68WsQ3btdTRK726StQWNcDzaHzcrP5QWpzpQkNu recursive
QmeNwDwUfwE6a5VeR6BpnLjSJ2QczNPkUZvuxSf1P8zG62 recursive
Qmf9XFmgjb3NCr6HQaFbPEcdqnXKd2cYPTgfgz1UQArRBn recursive
QmWR3AvhDtc5CJyAck2QeAsvVogEUQVdxiWL4E2uEBXw3g recursive
QmbMmFSkJjFxZgzSqe9HnCGhNZjVSht4UyFUg4w1X7pFkB recursive
QmbfuTBAVkcuTJu36kVmANLMpUzGKwMURy53reSbdr4Nth recursive


npx hardhat test
# Chạy bộ kiểm thử (test) smart contract trong Hardhat.

PS E:\Game_blockchain\nft-marketplace> truffle exec src/backend/scripts/deploy.js --network localhost
Using network 'localhost'.

Deploying contracts with the account: 0x46A293A3bE5e011ab2187b444c905E74BC0d4923
NFT contract deployed at: 0xe9e873387F90231843Cc411E58A7F687deB5ec86
Marketplace contract deployed at: 0x5c2EE0305b698e4566f6F3B1d3c35683548a0F2e
PS E:\Game_blockchain\nft-marketplace> 

