import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ThemeProvider,
  Modal,
  Dropdown,
  RadioButton,
  Frame,
  Fieldset,
  Button
} from '@react95/core';
import '@react95/icons/icons.css';
import './assets/desktop-styling.css';
import logoImg from './assets/ep-logo.jpg';
import nateImg from './assets/DiscoNate.jpg';
import craigImg from './assets/DiscoCraig.jpg';
import willImg from './assets/DiscoWill.jpg';
import paulyImg from './assets/DiscoPaul.jpg';
import * as strings from './text/Strings.ts';
import CharacterModal from './components/CharacterModal.tsx';
import EPStartMenu from './components/EPStartMenu.tsx';
import useEpisodeInsight from './hooks/useEpisodeInsight.tsx';
import useEpisodeSeasonString from './hooks/useEpisodeSeasonString.tsx';
import useEpisodeTitles from './hooks/useEpisodeTitles.tsx';
import useEpisodeDescription from './hooks/useEpisodeDescription.tsx';
import useRssEpisodeFinder from './hooks/useRssEpisodeFinder.tsx';

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');
  const [currentId, setCurrentId] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentRadio, setCurrentRadio] = useState<string>('');
  const [insightsEnabled, setInsightsEnabled] = useState<boolean>(false);
  const [feedRss, setFeedRssRaw] = useState<string>('');
  // we're gonna need the element `link` and `itunes:image`

  const fetchRssFeed = async () => {
    try {
      const response = await fetch(strings.EP_FEED_URL);
      setFeedRssRaw(await response.text());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Update all relevant text strings to match current episode
  const updateSelectedEpisodeText = (title: string) => {
    var epId = useEpisodeSeasonString(title, parsedFeed);

    if (epId == '') {
      setEpisodeText('error!');
      return;
    }

    setCurrentId(epId);
    setCurrentTitle(title);
    setInsightsEnabled(useEpisodeInsight(epId) !== strings.NO_INSIGHT);
  }

  const updateUrlForPlayer = async () => {
    if (playerOpen) {
      setPlayerOpen(false);
      return;
    }
    var xml = useRssEpisodeFinder(currentTitle, parsedFeed);
    if (xml) {
      var url = xml.getElementsByTagName("enclosure")[0].getAttribute('url');
      if (url) {
        setCurrentFile(url);
        setPlayerOpen(true);
      }
    }
  }

  const toggleDescriptionOrInsight = async () => {
    // Update the episode text based on the selectedRadio value
    if (currentRadio === 'd') {
      // Display description
      const episodeText = useEpisodeDescription(currentTitle, parsedFeed);
      setEpisodeText(episodeText);
    } else if (currentRadio === 'i') {
      // Display insights
      setEpisodeText(useEpisodeInsight(currentId));
    }
  }

  // Use useMemo to memoize parsedFeed
  const parsedFeed = useMemo(() => {
    return new window.DOMParser().parseFromString(feedRss, 'text/xml').querySelectorAll("item");
  }, [feedRss]);

  // Get podcast XML data on page load
  useEffect(() => {
    fetchRssFeed();
  }, []);

  // When we get the RSS feed XML back, select the first item in the list
  useEffect(() => {
    if (feedRss && !currentTitle) {
      // Populate the dropdown with episode titles
      let titles = useEpisodeTitles(feedRss);
      setTitles(titles);
      setCurrentRadio('d');
      setCurrentTitle(titles[0] ?? ''); //populate dropdown with most recent episode
    }
  }, [feedRss]);

  // When the active episode changes, see if the insight button should be enabled
  useEffect(() => {
    setInsightsEnabled(useEpisodeInsight(currentId) !== strings.NO_INSIGHT);
  }, [currentId]);

  useEffect(() => {
    updateSelectedEpisodeText(currentTitle);
  }, [currentTitle]);

  // When we change radio OR dropdown options
  useEffect(() => {
    toggleDescriptionOrInsight();
  }, [currentRadio, currentTitle]);

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
                    defaultValue={currentTitle}
                    onChange={e => updateSelectedEpisodeText(e.currentTarget.value) } />
                  <div className="toggle-options" style={{margin: '12px 0 -12px 0'}}>
                    <RadioButton
                      value={'d'}
                      className='row-two'
                      checked={currentRadio === 'd'}
                      onChange={() => setCurrentRadio('d')}>
                      Description
                    </RadioButton>
                    <RadioButton
                      value={'i'}
                      className='row-two'
                      checked={currentRadio === 'i'}
                      onChange={() => setCurrentRadio('i')}
                      disabled={!insightsEnabled}>
                      Insights
                    </RadioButton>
                  </div>
                </Fieldset>
                <div className="right">
                  <Button onClick={() => { updateUrlForPlayer(); }}>
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
        >{strings.ABOUT_PODCAST}</Modal>
        )}
        {nateOpen && (
          <CharacterModal
            isOpen={nateOpen}
            clickFunc={() => { setNateOpen(false) }}
            title={strings.NATE_TITLE}
            bio={strings.NATE_BIO}
            posish={[90,355]}
            icon={<img src={nateImg} width={32} />} />
        )}
        {craigOpen && (
          <CharacterModal
            isOpen={craigOpen}
            clickFunc={() => { setCraigOpen(false) }}
            title={strings.CRAIG_TITLE}
            bio={strings.CRAIG_BIO}
            posish={[440,100]}
            icon={<img src={craigImg} width={32} />} />
        )}
        {willOpen && (
          <CharacterModal
            isOpen={willOpen}
            clickFunc={() => { setWillOpen(false) }}
            title={strings.WILL_TITLE}
            bio={strings.WILL_BIO}
            posish={[500, 290]}
            icon={<img src={willImg} width={32} />} />
        )}
        {paulyOpen && (
          <CharacterModal
            isOpen={paulyOpen}
            clickFunc={() => { setPaulyOpen(false) }}
            title={strings.PAULY_TITLE}
            bio={strings.PAULY_BIO}
            posish={[40,70]}
            icon={<img src={paulyImg} width={32} />} />
        )}
        {playerOpen && (
          <Modal
            width="310"
            height="auto"
            title="Episode player"
            defaultPosition={{x: 40, y: 350}}
            closeModal={() => {setPlayerOpen(false)}} >
            <audio src={currentFile} controls />
          </Modal>
        )}
      </div>
      <div className="image-container">
        <img src={logoImg} alt="podcast logo" />
      </div>
    </ThemeProvider>
  );
};

export default App;