const url = 'https://alchemy-rag-2-main.onrender.com/api/users/login'; // Đã thay bằng link thật

async function testLogin() {
  console.log(`Đang gọi API tới: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log("Mã trạng thái HTTP (Status):", response.status);
    console.log("Kết quả trả về:", data);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.message);
  }
}

testLogin();
