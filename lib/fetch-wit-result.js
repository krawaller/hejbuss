export default function fetchWitResult(query) {
  return fetch(
    `https://api.wit.ai/message?v=20170516&verbose=true&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: 'Bearer F72KRS5GE6GWTW43LD4NE6TKQWM7DOZ7'
      }
    }
  )
    .then(response => response.json())
    .then(
      (
        {
          entities: {
            location: locations = [],
            query: [{ value: query } = {}] = [],
            what: [{ value: what } = {}] = [],
            from: [{ value: from } = {}] = [],
            to: [{ value: to } = {}] = []
          } = {}
        } = {}
      ) => ({
        query,
        from: from ||
          ((locations.length > 1 && locations[0]) || {}).value ||
          null,
        to: to ||
          ((locations.length > 1 ? locations[1] : locations[0]) || {}).value ||
          null,
        what
      })
    );
}
