function useEpisodeDescription(title: string, feed: NodeListOf<Element>): string {
  var e = useRssEpisodeFinder(title, feed);
  if (!e)
    return 'N/A';

  var descriptionObj = e.getElementsByTagName("description");
  var descriptionText = descriptionObj[0].textContent;
  if (descriptionText?.startsWith('<p>')) {
    descriptionText = descriptionText.substring(3, descriptionText.length - 5);
  }
  return descriptionText ?? 'No description!';
}