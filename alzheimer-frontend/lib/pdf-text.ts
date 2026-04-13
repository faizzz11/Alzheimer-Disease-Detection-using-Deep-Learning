import PDFParser from "pdf2json";

interface PDFData {
  Pages: {
    Texts: { R: { T: string }[] }[];
  }[];
}

/** Extract plain text from a PDF buffer (pdf2json). */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataReady", (pdfData: PDFData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" "),
      ).join("\n");
      resolve(text);
    });
    pdfParser.on("pdfParser_dataError", reject);
    pdfParser.parseBuffer(pdfBuffer);
  });
}
