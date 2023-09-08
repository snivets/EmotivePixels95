import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { Button, Frame, GroupBox, Radio, Select, styleReset } from 'react95';
// pick a theme of your choice
import original from 'react95/dist/themes/original';
// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';
import { useEffect, useState } from 'react';
import notes from './assets/episode-notes.json';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';
const POD_TITLE = "Emotive Pixels: Videogame Deep Dives";

var feedRssRaw = '';
var feedEpisodesParsed: NodeListOf<Element>;

function populateFeedEpisodesParsed() {
  if (!feedEpisodesParsed)
    feedEpisodesParsed = new window.DOMParser().parseFromString(feedRssRaw, 'text/xml').querySelectorAll("item");
}

function getTitles() {
  var titlesInclusive = new window.DOMParser()
    .parseFromString(feedRssRaw, 'text/xml')
    .querySelectorAll("title");
  return Array.from(titlesInclusive)
    .map(t => t.textContent)
    .filter(val => val !== '' && val !== POD_TITLE);
}

function getNotes() {
  console.log(notes[0].notes);
}

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  body, textarea {
    font-family: 'ms_sans_serif';
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  #grid-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 10px;
    width: 100vw;
    height: 100vh;
    align-items: end;
  }
  .row-one { grid-row: 1; }
  .row-two { grid-row: 2; }
  .row-four { grid-row: 4; }
  .full-width { grid-column: 2 / 3; }
`;

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');

  var titleList: any[] = [];

  const fetchData = async () => {
    try {
      // Get the podcast RSS feed
      const response = await fetch(EP_FEED_URL);
      feedRssRaw = await response.text();
      
      // Populate the dropdown with episode titles
      const titles = getTitles();
      titles.forEach(function(element) {
        titleList.push({ label: element, value: element })
      });
      setTitles(titleList);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getEpisodeTextFromEpisodeTitle = async (title: string) => {
    populateFeedEpisodesParsed();

    // Figure out which season and episode has this title
    feedEpisodesParsed.forEach(e => {
      const titleElement = e.querySelector("title");

      if (titleElement && titleElement.textContent === title) {
        var epId = 'bonus'; //default case
        var episode = e.getElementsByTagName("itunes:episode");
        var season = e.getElementsByTagName("itunes:season");
        if (episode.length > 0) {
          epId = `S${season[0].textContent}E${episode[0].textContent}`;
        }

        var bonusText = notes.filter(n => n.episodeId == epId)[0].notes;
        if (bonusText !== 'bonus')
          setEpisodeText(bonusText);
        else
          setEpisodeText(title);
      }
    });

  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <div id='grid-wrapper'>
          <Button className='row-four full-width'>Start menu placeholder!</Button>   
          <div className='row-two full-width'>
            <GroupBox label="Episode Chooser 1995">
              <div>
                <Select
                  options={titles}
                  menuMaxHeight={250}
                  width={400}
                  onChange={e => getEpisodeTextFromEpisodeTitle(e.value as string) } />
              </div>
              <div>
                <Radio value={'d'} label={'Description'} className='row-two' />
                <Radio value={'i'} label={'Insights'} className='row-two' />
              </div>
            </GroupBox>
            <Frame
              variant='outside'
              shadow
              style={{ padding: '0.5rem', lineHeight: '1.5', width: 600 }}>
                {episodeText}
            </Frame>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;