import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.resolve(__dirname, "../docs");
const outputDir = path.resolve(__dirname, "../docs/public");
const outputFile = path.join(outputDir, "llms.txt");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
	const files = fs.readdirSync(dirPath);

	files.forEach((file) => {
		const fullPath = path.join(dirPath, file);
		if (fs.statSync(fullPath).isDirectory()) {
			// Exclude public, .vitepress, and node_modules
			if (
				file !== "public" &&
				file !== ".vitepress" &&
				file !== "node_modules"
			) {
				getAllFiles(fullPath, arrayOfFiles);
			}
		} else {
			if (file.endsWith(".md")) {
				arrayOfFiles.push(fullPath);
			}
		}
	});

	return arrayOfFiles;
}

const files = getAllFiles(docsDir);

let content = "# Hiraku Documentation\n\n";

files.sort().forEach((file) => {
	const relativePath = path.relative(docsDir, file);
	// Skip the output file itself if it happens to be in the list (though we excluded public folder)
	if (path.resolve(file) === outputFile) return;

	const fileContent = fs.readFileSync(file, "utf-8");

	// Remove frontmatter
	// Matches --- at start, followed by anything, followed by \n---\n
	const contentWithoutFrontmatter = fileContent.replace(
		/^---\n([\s\S]*?)\n---\n/,
		"",
	);

	content += `## File: ${relativePath}\n\n`;
	content += contentWithoutFrontmatter;
	content += "\n\n---\n\n";
});

fs.writeFileSync(outputFile, content);
console.log(`Generated ${outputFile}`);
