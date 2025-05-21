import fs from "fs/promises";
import { parseStringPromise } from "xml2js";
import Fuse from "fuse.js";
import path from "path";

const outputFolder = "./parsed_output";
const outputFile = path.join(outputFolder, "items.json");

interface XmlItem {
  title: string[];
  link: string[];
  assignee?: string[];
  summary?: string[];
  dateCreated?: string[];
  [key: string]: any;
}

interface ParsedItem extends XmlItem {
  titleWithoutTicket: string;
}

interface SearchResult {
  matchScore: string;
  titleWithoutTicket: string;
  originalTitle: string;
  link: string;
  assignee: string | null;
  summary: string | null;
  dateCreated: string | null;
}

export async function searchXmlItems(filePath: string, searchTerm: string): Promise<SearchResult[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");

    const result = await parseStringPromise(data);
    const items: XmlItem[] = result.rss.channel[0].item;

    const cleanedItems: ParsedItem[] = items.map((item) => {
      const originalTitle = item.title[0];
      const titleWithoutTicket = originalTitle.replace(/^\[\w+-\d+\]\s*/, "");
      return {
        ...item,
        titleWithoutTicket,
      };
    });

    const fuse = new Fuse(cleanedItems, {
      keys: ["titleWithoutTicket"],
      includeScore: true,
      threshold: 0.1,
      ignoreLocation: true,
    });

    const results = fuse.search(searchTerm);

    const mappedResults: SearchResult[] = results.map(({ item, score }) => ({
      matchScore: (1 - (score ?? 0)).toFixed(2),
      titleWithoutTicket: item.titleWithoutTicket,
      originalTitle: item.title[0],
      link: item.link[0],
      assignee: item.assignee?.[0] || null,
      summary: item.summary?.[0] || null,
      dateCreated: item.dateCreated?.[0] || null,
    }));

    return mappedResults;
  } catch (error) {
    console.error("Error processing XML:", error);
    throw error;
  }
}
