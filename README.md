npx hardhat node
# khởi chạy một blockchain Ethereum giả lập trên máy tính 

npx hardhat run src/backend/scripts/deploy.js --network localhost 
# Deploy hợp đồng vào blockchain cục bộ: Hợp đồng sẽ được deploy lên Hardhat Network.
PS E:\Game_blockchain\nft-marketplace> npx hardhat run src/backend/scripts/deploy.js --network localhost
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 9999997789660750000000
NFT contrac address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512


console.log(NFT);
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


