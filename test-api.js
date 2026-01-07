import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCJeIO8g4AjX8hyS3Wvj7XPg9mlnuWIZkw";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
    try {
        console.log("Testing Gemini API...");
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        
        console.log("✅ SUCCESS!");
        console.log("Response:", response.text());
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        console.error("Full error:", error);
    }
}

testAPI();