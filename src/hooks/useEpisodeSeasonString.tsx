// Get the string that describes an episode's position, e.g. S3E10
function useEpisodeSeasonString(title: string, feed: NodeListOf<Element>): string {
  var e = useRssEpisodeFinder(title, feed);
  if (!e) {
      return '';
  }
  
  var epId = 'bonus'; //default case
  var episode = e.getElementsByTagName("itunes:episode");
  var season = e.getElementsByTagName("itunes:season");
  if (episode.length > 0) {
    epId = `S${season[0].textContent}E${episode[0].textContent}`;
  }

  return epId;
}