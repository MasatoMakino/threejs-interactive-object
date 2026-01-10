/**
 * デモパスからデモ名を抽出し、URLエンコードされたデモ名を返します (例: "sub/demoSub.html" -> "sub%2FdemoSub")
 */
// biome-ignore lint/correctness/noUnusedVariables: used for demo name extraction
function getDemoNameFromPath(path) {
  if (!path) return null;

  var demoPath = path;
  if (demoPath.endsWith(".html")) {
    demoPath = demoPath.substring(0, demoPath.length - ".html".length);
  } else {
    return null; // Only process .html files
  }

  return encodeURIComponent(demoPath);
}
