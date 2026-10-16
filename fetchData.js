async function fetchData(signal) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
