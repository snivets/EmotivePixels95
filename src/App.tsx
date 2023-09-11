import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Button, Frame, GroupBox, Radio, Select, styleReset } from 'react95';
import original from 'react95/dist/themes/original';
// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

import notes from './assets/episode-notes.json';
import './assets/desktop-styling.css';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';
const POD_TITLE = "Emotive Pixels: Videogame Deep Dives";
const NO_INSIGHT = 'We haven\'t written any insight for this episode yet 😥';

var parsedFeed: NodeListOf<Element>;

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
`;

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [feedRssRaw, setFeedRssRaw] = useState<string>('');

  var titleList: any[] = [];

  const fetchData = async () => {
    try {
      // Get the podcast RSS feed via fetch
      const response = await fetch(EP_FEED_URL);
      setFeedRssRaw(await response.text());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function findEpisodeXmlItem(title: string): Element | null {
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

  function getEpisodeDescriptionFromEpisodeTitle(title: string): string {
    var e = findEpisodeXmlItem(title);
    if (!e)
      return 'N/A';

    var descriptionObj = e.getElementsByTagName("description");
    var descriptionText = descriptionObj[0].textContent;
    return descriptionText ?? 'No description!';
  }

  function getEpisodeInsightFromEpisodeId(episodeId: string): string {
    var insight = NO_INSIGHT;
    var attempt = notes.filter(n => n.episodeId == episodeId);
    if (attempt.length > 0) {
      insight = attempt[0].notes;
    }
    return insight;
  }

  // Used to populate the episode selector dropdown
  function getTitles() {
    var titlesInclusive = new window.DOMParser()
      .parseFromString(feedRssRaw, 'text/xml')
      .querySelectorAll("title");
    return Array.from(titlesInclusive)
      .map(t => t.textContent)
      .filter(val => val !== '' && val !== POD_TITLE);
  }

  const getEpisodeSeasonString = (title: string) => {
    var e = findEpisodeXmlItem(title);
    var epId = 'bonus'; //default case
    if (!e) {
      setEpisodeText('error!');
      return;
    }

    var episode = e.getElementsByTagName("itunes:episode");
    var season = e.getElementsByTagName("itunes:season");
    if (episode.length > 0) {
      epId = `S${season[0].textContent}E${episode[0].textContent}`;
    }

    setSelectedEpisodeId(epId);
    setSelectedEpisodeTitle(title);
  }

  const updateFrameInfo = async () => {
    // Update the episode text based on the selectedRadio value
    if (selectedRadio === 'd') {
      // Display description
      setEpisodeText(getEpisodeDescriptionFromEpisodeTitle(selectedEpisodeTitle));
    } else if (selectedRadio === 'i') {
      // Display insights
      setEpisodeText(getEpisodeInsightFromEpisodeId(selectedEpisodeId));
    }
  }
  

  const isThereInsight = () => {
    return getEpisodeInsightFromEpisodeId(selectedEpisodeId) === NO_INSIGHT;
  }

  // Get podcast XML data on page load
  useEffect(() => {
    fetchData();
  }, []);

  // When we get the RSS feed XML back
  useEffect(() => {
    if (feedRssRaw) {
      // Populate the dropdown with episode titles
      const titles = getTitles();
      titles.forEach(function(element) {
        titleList.push({ label: element, value: element })
      });
      setTitles(titleList);
      parsedFeed = new window.DOMParser().parseFromString(feedRssRaw, 'text/xml').querySelectorAll("item");
      setSelectedRadio('d');
      setSelectedEpisodeTitle(titleList[0].label); //populate dropdown with most recent episode
    }
  }, [feedRssRaw]);

  // When we change radio options
  useEffect(() => {
    updateFrameInfo();
  }, [selectedRadio]);

  // When we change dropdown options
  useEffect(() => {
    updateFrameInfo();
  }, [selectedEpisodeTitle]);

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
                  value={selectedEpisodeTitle}
                  onChange={e => getEpisodeSeasonString(e.value as string) } />
              </div>
              <div className="text-toggle-group">
                <Radio
                  value={'d'}
                  label={'Description'}
                  className='row-two'
                  checked={selectedRadio === 'd'}
                  onChange={() => setSelectedRadio('d')}
                />
                <Radio
                  value={'i'}
                  label={'Insights'}
                  className='row-two'
                  checked={selectedRadio === 'i'}
                  onChange={() => setSelectedRadio('i')}
                  disabled={ isThereInsight() }
                />
              </div>
            </GroupBox>
            <Frame
              variant='outside'
              shadow={true}
              style={{ padding: '0.5rem', lineHeight: '1.5', width: 600 }}
              dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(episodeText)}} />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;