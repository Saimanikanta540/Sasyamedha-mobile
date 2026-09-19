import { stitch } from "@google/stitch-sdk";
import fs from "fs/promises";
import path from "path";

async function main() {
  const projectId = "5012185308925259622";
  const apiKey = "YOUR_API_KEY";
  
  process.env.STITCH_API_KEY = apiKey;
  const project = stitch.project(projectId);

  const screens = ["386e198e8786459b8b8a2166146522b8", "43ccf279d50a44d9a9f9e3f5748a9265", "6dbce627ff0e471b960810e80bf8ac14"];
  
  for (const id of screens) {
    try {
      const screen = project.screen(id);
      const htmlUrl = await screen.getHtml();
      
      const res = await fetch(htmlUrl);
      const html = await res.text();
      
      await fs.writeFile(path.join(process.cwd(), `screen_${id}.html`), html);
      console.log(`Saved screen_${id}.html`);
    } catch (e) {
      console.error(`Error on ${id}:`, e.message);
    }
  }
}

main();
