export async function fetchData(signal) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Server returned HTTP ${response.status}. Please try again.`,
    );
  }

  const data = await response.json();

  return data;
}
