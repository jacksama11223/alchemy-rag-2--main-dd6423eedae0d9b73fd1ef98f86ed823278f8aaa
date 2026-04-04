const axios = require('axios');

async function testRoadmap() {
    try {
        console.log("Testing AI Roadmap Generation...");
        // Use a test user token (Assuming you have one or the DB is local)
        const response = await axios.post('http://localhost:5000/api/roadmap/generate', {
            topic: "Lập trình React cơ bản",
            difficulty: "Easy",
            stagesCount: 2
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN' // You'd need a real token here
            }
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

// testRoadmap();
