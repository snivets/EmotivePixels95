function useRssEpisodeFinder(title: string, parsedFeed: NodeListOf<Element>): Element | null {
  // Figure out which season and episode has this title
  var foundE = null;
  parsedFeed.forEach(e => {
    const titleElement = e.querySelector("title");

    if (titleElement && titleElement.textContent === title) {
      foundE = e;
      return;
    }
  });
  return foundE;
}

export default useRssEpisodeFinder;