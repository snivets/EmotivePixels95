import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

import { createGlobalStyle, ThemeProvider } from 'styled-components';
import {
  Button,
  GroupBox,
  Radio,
  Select,
  styleReset,
  AppBar,
  Toolbar,
  MenuList,
  MenuListItem,
  Separator,
  TextInput,
  WindowHeader,
  Window,
  WindowContent,
  ScrollView
} from 'react95';
import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

import notes from './assets/episode-notes.json';
import logoImg from './assets/ep-icon.png';
import './assets/desktop-styling.css';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';
const POD_TITLE = "Emotive Pixels: Videogame Deep Dives";
const NO_INSIGHT = 'We haven\'t written any insight for this episode yet 😥';

const NATE_TITLE = "Techno Rebel Nate";
const CRAIG_TITLE = "Coloradical Craig";
const WILL_TITLE = "Commandline Will";
const PAULY_TITLE = "Diskjokke Pauly";

const NATE_BIO = "Nate is a loud tall blonde with many passions, most of them boiling down to either architecture, human cultures, or independent music and games. Given that I wrote this I can say that honestly my gaming role model is Chris Plante. Sometimes I wonder if I like books more than games.";
const CRAIG_BIO = "Craig is a Coloradan in all senses of the term, except that he has a high-functioning job and is in touch with his emotions. He loves all things Sony, and is deeply immersed in all the happenings of the industry. Will someone get this guy a studio executive job already?!";
const WILL_BIO = "Will is a genius, the biggest and boldest gamer among us (and by that I mean he could complete Factorio the quickest and loves FTL the most), and shows up whenever he feels like it. Unfortunately, we often disappoint him with our choice of games - either too obscure, or insufficiently GAMEY. He loves systems, JRPGs, and Brandon Sanderson. He resides in Seattle, the original hub of the podcast, and in fact lived for a time above the Uwajimaya in the very room where the early episodes were recorded.";
const PAULY_BIO = "Pauly is the friendly likeable one of the lot, a charming man from New England who loves music, plays music, and is picking up DJing. He likes many kinds of games in no particular pattern that I can discern, but suffice it to say he has great taste. He lives in Syracuse, NY.";

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

function CharacterModal(props: any) {
  return (
    <Window className='window half-width pauly-dialog'>
      <WindowHeader active={true} className='window-title'>
        <span>
          {props.title}
        </span>
        <Button onClick={props.clickFunc}>
          <span className='close-icon' />
        </Button>
      </WindowHeader>
      <WindowContent>
        {props.bio}
      </WindowContent>
    </Window>
  );
}

// Props: open (state), open, funcs for each person's dialog
function EPStartMenu(props: any) {
  return (
    <AppBar className='row-four full-width'>
      <Toolbar style={{ justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Button
            onClick={() => props.setOpen(!props.open)}
            active={props.open}
            style={{ fontWeight: 'bold' }}
          >
            <img src={logoImg} alt='EP logo' style={{ height: '20px', marginRight: 4 }} />
            Start
          </Button>
          {props.open && (
            <MenuList
              style={{
                position: 'absolute',
                left: '0',
                top: '100%'
              }}
              onClick={() => props.setOpen(false)}
            >
              <MenuListItem onClick={props.nateModal}>
                <span role='img' aria-label={NATE_TITLE}>👱</span>
                Nate Stevens
              </MenuListItem>
              <MenuListItem onClick={props.willModal}>
                <span role='img' aria-label={WILL_TITLE}>👨‍💻</span>
                Will Atkinson
              </MenuListItem>
              <MenuListItem onClick={props.craigModal}>
                <span role='img' aria-label={CRAIG_TITLE}>🧗‍♂️</span>
                Craig Schuemann
              </MenuListItem>
              <MenuListItem onClick={props.paulyModal}>
                <span role='img' aria-label={PAULY_TITLE}>🧞‍♂️</span>
                Pauly Kroll
              </MenuListItem>
              <Separator />
              <MenuListItem disabled>
                <span role='img' aria-label='about'>ℹ️</span>
                About EP
              </MenuListItem>
            </MenuList>
          )}
        </div>
        <TextInput placeholder='Search episodes...' width={150} />
      </Toolbar>
    </AppBar>
  );
}

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [feedRssRaw, setFeedRssRaw] = useState<string>('');

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

  // Use useMemo to memoize parsedFeed
  const parsedFeed = useMemo(() => {
    return new window.DOMParser().parseFromString(feedRssRaw, 'text/xml').querySelectorAll("item");
  }, [feedRssRaw]);

  // Get podcast XML data on page load
  useEffect(() => {
    fetchData();
  }, []);

  // When we get the RSS feed XML back
  useEffect(() => {
    if (feedRssRaw) {
      // Populate the dropdown with episode titles
      const titles = getTitles();
      const updatedTitles = titles.map(element => ({ label: element, value: element }));
      setTitles(updatedTitles);
      setSelectedRadio('d');
      setSelectedEpisodeTitle(updatedTitles[0].label ?? ''); //populate dropdown with most recent episode
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

  const [open, setOpen] = useState(false);
  const [nateOpen, setNateOpen] = useState(false);
  const [craigOpen, setCraigOpen] = useState(false);
  const [willOpen, setWillOpen] = useState(false);
  const [paulyOpen, setPaulyOpen] = useState(false);

  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>j
        <div id='grid-wrapper'> 
          <Window className='row-two half-width'>
            <WindowContent>
              <GroupBox label="Episode insights">
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
                    disabled={ getEpisodeInsightFromEpisodeId(selectedEpisodeId) === NO_INSIGHT }
                  />
                </div>
              </GroupBox>
            </WindowContent>
            <ScrollView style={{ maxHeight: '200px' }}>
              <div
                style={{ padding: '0.5rem', lineHeight: '1.5', width: 500, maxHeight: '150px' }}
                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(episodeText)}} />
            </ScrollView>
          </Window>
          <EPStartMenu
            open={open}
            setOpen={setOpen}
            nateModal={setNateOpen}
            craigModal={ setCraigOpen}
            willModal={setWillOpen}
            paulyModal={setPaulyOpen} />
          {nateOpen && (
            <CharacterModal
              clickFunc={() => { setNateOpen(false); }}
              title={NATE_TITLE}
              bio={NATE_BIO} />
          )}
          {craigOpen && (
            <CharacterModal
              clickFunc={() => { setCraigOpen(false); }}
              title={CRAIG_TITLE}
              bio={CRAIG_BIO} />
          )}
          {willOpen && (
            <CharacterModal
              clickFunc={() => { setWillOpen(false); }}
              title={WILL_TITLE}
              bio={WILL_BIO} />
          )}
          {paulyOpen && (
            <CharacterModal
              clickFunc={() => { setPaulyOpen(false); }}
              title={PAULY_TITLE}
              bio={PAULY_BIO} />
          )}
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;