### 2. Install Dependencies:
```
$ cd nft_marketplace
$ npm install
```
### 3. Boot up local development blockchain
```
$ cd nft_marketplace
$ npx hardhat node
```

### 4. Connect development blockchain accounts to Metamask
- Copy private key of the addresses and import to Metamask
- Connect your metamask to hardhat blockchain, network 127.0.0.1:8545.
- If you have not added hardhat to the list of networks on your metamask, open up a browser, click the fox icon, then click the top center dropdown button that lists all the available networks then click add networks. A form should pop up. For the "Network Name" field enter "Hardhat". For the "New RPC URL" field enter "http://127.0.0.1:8545". For the chain ID enter "31337". Then click save.  


### 5. Migrate Smart Contracts
`npx hardhat run src/backend/scripts/deploy.js --network localhost`

### 6. Run Tests
`$ npx hardhat test`

### 7. Launch Frontend
`$ npm run start`


------------------------------------------------------------------

npx hardhat node
# khởi chạy một blockchain Ethereum giả lập trên máy tính 

npx hardhat run src/backend/scripts/deploy.js --network localhost 
# Deploy hợp đồng vào blockchain cục bộ: Hợp đồng sẽ được deploy lên Hardhat Network.
PS E:\Game_blockchain\nft-marketplace> npx hardhat run src/backend/scripts/deploy.js --network localhost 
Compiling 2 files with 0.8.4
Solidity compilation finished successfully
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 9999995809084385617612
NFT contrac address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Marketplace contrac address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0


console.log(NFT);
console.log(marketplace);
# Xem danh sách tất cả các hàm
console.log(await NFT.tokenCount()); 
# Xem số lượng token đã mint

Ctrl + C 2 lần hoặc gõ .exit
# Thoát

npx hardhat console --network localhost
#  Restart Hardhat console
PS E:\Game_blockchain\nft-marketplace> npx hardhat console --network localhost
>> 
Welcome to Node.js v20.11.0.
Type ".help" for more information.
> const contract = await ethers.getContractAt("NFT", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
undefined
> const tokenCount = await contract.tokenCount()
undefined
> tokenCount
BigNumber { value: "0" }
> const name = await contract.name()
undefined
> name
'DApp NFT'

const marketplace = await ethers.getContractAt("Marketplace", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
undefined
> const feeAccount = await marketplace.feeAccount()
undefined
> feeAccount
'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
> const itemCount = await marketplace.itemCount()
undefined
> itemCount
BigNumber { value: "0" }
> const feePercent = await marketplace.feePercent()
undefined
> feePercent
BigNumber { value: "1" }
>


npx hardhat test
# Chạy bộ kiểm thử (test) smart contract trong Hardhat.

