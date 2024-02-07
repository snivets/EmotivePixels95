// Used to populate the episode selector dropdown
function useEpisodeTitles(feedRss: string) {
  var titlesInclusive = new window.DOMParser()
      .parseFromString(feedRss, 'text/xml')
      .querySelectorAll("title");
  return Array.from(titlesInclusive)
      .map(t => t.textContent)
      .filter(val => val !== '' && val !== POD_TITLE);
}