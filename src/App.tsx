import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ThemeProvider,
  Modal,
  Dropdown,
  RadioButton,
  Frame,
  Fieldset,
  Video,
  Button
} from '@react95/core';
import '@react95/icons/icons.css';

import './text/Strings.ts';
import notes from './text/episode-notes.json';
import logoImg from './assets/ep-logo.jpg';
import nateImg from './assets/DiscoNate.jpg';
import craigImg from './assets/DiscoCraig.jpg';
import willImg from './assets/DiscoWill.jpg';
import paulyImg from './assets/DiscoPaul.jpg';
import './assets/desktop-styling.css';
import CharacterModal from './components/CharacterModal.tsx';
import EPStartMenu from './components/EPStartMenu.tsx';

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [selectedEpisodeFile, setSelectedEpisodeFile] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [insightsEnabled, setInsightsEnabled] = useState<boolean>(false);
  const [feedRssRaw, setFeedRssRaw] = useState<string>('');
  // we're gonna need the element `link` and `itunes:image`

// -------------------------
// XML DATA PROCESSING STUFF
// -------------------------
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
    if (descriptionText?.startsWith('<p>')) {
      descriptionText = descriptionText.substring(3, descriptionText.length - 5);
    }
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

  // Get the string that describes an episode's position, e.g. S3E10
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
    setInsightsEnabled(getEpisodeInsightFromEpisodeId(epId) !== NO_INSIGHT);
  }

// --------------------
// APP DATA STATE STUFF
// --------------------

  const loadPlayer = async () => {
    var xml = findEpisodeXmlItem(selectedEpisodeTitle);
    if (xml) {
      var url = xml.getElementsByTagName("enclosure")[0].getAttribute('url');
      if (url) {
        setSelectedEpisodeFile(url);
        setPlayerOpen(true);
      }
    }
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

  // When we get the RSS feed XML back, select the first item in the list
  useEffect(() => {
    if (feedRssRaw && !selectedEpisodeTitle) {
      // Populate the dropdown with episode titles
      let titles = getTitles();
      setTitles(titles);
      setSelectedRadio('d');
      setSelectedEpisodeTitle(titles[0] ?? ''); //populate dropdown with most recent episode
    }
  }, [feedRssRaw]);

  // When the active episode changes, see if the insight button should be enabled
  useEffect(() => {
    setInsightsEnabled(getEpisodeInsightFromEpisodeId(selectedEpisodeId) !== NO_INSIGHT);
  }, [selectedEpisodeId]);

  useEffect(() => {
    getEpisodeSeasonString(selectedEpisodeTitle);
  }, [selectedEpisodeTitle]);

  // When we change radio OR dropdown options
  useEffect(() => {
    updateFrameInfo();
  }, [selectedRadio, selectedEpisodeTitle]);

  const [startOpen, setStartOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [nateOpen, setNateOpen] = useState(false);
  const [craigOpen, setCraigOpen] = useState(false);
  const [willOpen, setWillOpen] = useState(false);
  const [paulyOpen, setPaulyOpen] = useState(false);

  return (
    <ThemeProvider>
      <div id='grid-wrapper'> 
        <div className='row-two half-width'>
          <Frame padding={4}>
            <Frame boxShadow="in" padding={8} margin={2}>
              <div className="container">
                <Fieldset className="left" legend="Episode browser">
                  <Dropdown
                    options={titles}
                    defaultValue={selectedEpisodeTitle}
                    onChange={e => getEpisodeSeasonString(e.currentTarget.value) } />
                  <div className="toggle-options" style={{margin: '12px 0 -12px 0'}}>
                    <RadioButton
                      value={'d'}
                      className='row-two'
                      checked={selectedRadio === 'd'}
                      onChange={() => setSelectedRadio('d')}>
                      Description
                    </RadioButton>
                    <RadioButton
                      value={'i'}
                      className='row-two'
                      checked={selectedRadio === 'i'}
                      onChange={() => setSelectedRadio('i')}
                      disabled={!insightsEnabled}>
                      Insights
                    </RadioButton>
                  </div>
                </Fieldset>
                <div className="right">
                  <Button onClick={() => { loadPlayer(); }}>
                    Player
                  </Button>
                </div>
              </div>
              <Frame style={{ maxHeight: '150px', width: 500, overflowY: 'auto', padding: '0.5rem', margin: '16px 2px 2px 2px' }}>
                <div 
                  style={{ lineHeight: '1.1' }}
                  dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(episodeText)}} />
              </Frame>
            </Frame>
          </Frame>
        </div>
        <EPStartMenu
          open={startOpen}
          setOpen={setStartOpen}
          nateModal={setNateOpen}
          craigModal={setCraigOpen}
          willModal={setWillOpen}
          paulyModal={setPaulyOpen} />
        {aboutOpen && (
          <Modal
            width="440"
            height="auto"
            icon={<img src={logoImg} width={32} />}
            title="About this podcast"
            defaultPosition={{x: 5, y: 25}}
            closeModal={() => { setAboutOpen(false) }}
        >{ABOUT_PODCAST}</Modal>
        )}
        {nateOpen && (
          <CharacterModal
            isOpen={nateOpen}
            clickFunc={() => { setNateOpen(false) }}
            title={NATE_TITLE}
            bio={NATE_BIO}
            posish={[90,355]}
            icon={<img src={nateImg} width={32} />} />
        )}
        {craigOpen && (
          <CharacterModal
            isOpen={craigOpen}
            clickFunc={() => { setCraigOpen(false) }}
            title={CRAIG_TITLE}
            bio={CRAIG_BIO}
            posish={[440,100]}
            icon={<img src={craigImg} width={32} />} />
        )}
        {willOpen && (
          <CharacterModal
            isOpen={willOpen}
            clickFunc={() => { setWillOpen(false) }}
            title={WILL_TITLE}
            bio={WILL_BIO}
            posish={[500, 290]}
            icon={<img src={willImg} width={32} />} />
        )}
        {paulyOpen && (
          <CharacterModal
            isOpen={paulyOpen}
            clickFunc={() => { setPaulyOpen(false) }}
            title={PAULY_TITLE}
            bio={PAULY_BIO}
            posish={[40,70]}
            icon={<img src={paulyImg} width={32} />} />
        )}
        {playerOpen && (
          <Video w="320" src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
        )}
      </div>
      <div className="image-container">
        <img src={logoImg} alt="podcast logo" />
      </div>
    </ThemeProvider>
  );
};

export default App;