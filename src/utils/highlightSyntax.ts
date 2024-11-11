export function highlightSyntax(json: string, styles: CSSModuleClasses) {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
    match => {
      let cls = 'number'
      if (match.startsWith("\"")) {
        if (match.endsWith(":")) {
          cls = 'key'
        } else {
          cls = 'string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (match.includes('null')) {
        cls = 'null'
      }
      return `<span class="${styles[cls]}">${match}</span>`
    }
  )
}
