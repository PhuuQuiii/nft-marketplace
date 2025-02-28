module.exports = {
    networks: {
      localhost: {
        host: "127.0.0.1",
        port: 7545, // Mặc định của Ganache
        network_id: "*",
      },
    },
    compilers: {
      solc: {
        version: "0.8.4", // Đảm bảo hợp lệ với contract của bạn
      },
    },
    contracts_build_directory: "./src/backend/artifacts", // Nơi lưu trữ compiled contracts
    contracts_directory: "./src/backend/contracts", // Thư mục chứa smart contracts
    migrations_directory: "./src/backend/migrations", // Nơi chứa file migrate
    test_directory: "./src/backend/test", // Nơi chứa file test
  };
  