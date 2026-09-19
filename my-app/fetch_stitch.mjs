import { stitch } from "@google/stitch-sdk";

async function main() {
  const projectId = "5012185308925259622";
  const project = stitch.project(projectId);

  try {
    const screens = await project.screens();
    for (const screen of screens) {
      console.log(`Screen ID: ${screen.id}`);
      const htmlUrl = await screen.getHtml();
      const imageUrl = await screen.getImage();
      console.log(`HTML URL: ${htmlUrl}`);
      console.log(`Image URL: ${imageUrl}`);
    }
  } catch (error) {
    console.error("Error fetching screens:", error);
  }
}

main();
