const riversSelect = document.querySelector('#river')
const rivers = []
for (let i = 0; i < riversSelect.length; i++) {
  rivers.push(riversSelect.options[i].text)
}

function normalise(string) {
  const bracketIndex = string.indexOf('(')
  const stringWithoutBracketEnding = bracketIndex >= 0 ? string.slice(0, bracketIndex) : string
  return stringWithoutBracketEnding.toLowerCase().trim()
}

function score(name, query) {
  if (name.startsWith(query)) {
    return -2
  }
  if (name.includes(query)) {
    return -1
  }
  return 0
}

function getRiversSuggestions(query, populateResults) {
  const filteredRivers = rivers.map(river => ({ name: river, score: score(normalise(river), normalise(query)) }))
    .filter(river => river.score < 0)
    .sort((a, b) => a.score - b.score)
    .map(river => river.name)

  return populateResults(filteredRivers)
}

module.exports = {
  getRiversSuggestions
}
