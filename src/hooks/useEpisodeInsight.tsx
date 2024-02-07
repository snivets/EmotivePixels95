import notes from '../text/episode-notes.json';

function useEpisodeInsight(episodeId: string): string {
  var insight = NO_INSIGHT;
  if (!notes) {
    console.error('No episode notes found :(');
    return insight;
  }
  var attempt = notes.filter(n => n.episodeId == episodeId);
  if (attempt.length > 0) {
    insight = attempt[0].notes;
  }
  return insight;
}

export default useEpisodeInsight;