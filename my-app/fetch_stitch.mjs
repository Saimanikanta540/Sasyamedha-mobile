import { stitch } from "@google/stitch-sdk";

async function main() {
  const projectId = "5012185308925259622";
  const apiKey = "YOUR_API_KEY";
  
  process.env.STITCH_API_KEY = apiKey;
  const project = stitch.project(projectId);

  try {
    const screenId = "a53f4c138d0943a8a5b623fa09e4b15e";
    const screen = project.screen(screenId);
    
    console.log(`Fetching specific screen: ${screenId}`);
    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();
    console.log(`HTML URL: ${htmlUrl}`);
    console.log(`Image URL: ${imageUrl}`);
  } catch (error) {
    console.error("Error fetching specific screen:", error);
  }
}

main();
