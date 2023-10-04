import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

import {
  ThemeProvider,
  TaskBar,
  List,
  Modal,
  Dropdown,
  RadioButton,
  Frame,
  Fieldset
} from '@react95/core';
import '@react95/icons/icons.css';

import notes from './assets/episode-notes.json';
import logoImg from './assets/ep-logo.jpg';
import nateImg from './assets/DiscoNate.jpg';
import craigImg from './assets/DiscoCraig.jpg';
import willImg from './assets/DiscoWill.jpg';
import paulyImg from './assets/DiscoPaul.jpg';
import './assets/desktop-styling.css';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';
const POD_TITLE = "Emotive Pixels: Videogame Deep Dives";
const NO_INSIGHT = "We haven\'t written any insight for this episode yet 😥";
const ABOUT_PODCAST = "Hi! You've reached the website for Emotive Pixels, a videogame podcast hosted by a group of friends that originally met around a table in Seattle to casually banter about games we played. These days, we're a little more focused, and we have a bit more specific goals in how we cover games, so there's a fair difference between early episodes (labeled 'Season 1', up through episode 55) and the current seasons. You can find out about the hosts here, browse and listen to our episodes, and even get some behind-the-scenes insight on fun facts about each show.";

const NATE_TITLE = "Techno Rebel Nate";
const CRAIG_TITLE = "Coloradical Craig";
const WILL_TITLE = "Commandline Will";
const PAULY_TITLE = "Diskjokke Pauly";

const NATE_BIO = "Nate is a loud tall blonde with many passions, most of them boiling down to either architecture, human cultures, or independent music and games. Given that I wrote this I can say that honestly my gaming role model is Chris Plante. Sometimes I wonder if I like books more than games.";
const CRAIG_BIO = "Craig is a Coloradan in all senses of the term, except that he has a high-functioning job and is in touch with his emotions. He loves all things Sony, and is deeply immersed in all the happenings of the industry. Will someone get this guy a studio executive job already?!";
const WILL_BIO = "Will is a genius, the biggest and boldest gamer among us (and by that I mean he could complete Factorio the quickest and loves FTL the most), and shows up whenever he feels like it. Unfortunately, we often disappoint him with our choice of games - either too obscure, or insufficiently GAMEY. He loves systems, JRPGs, and Brandon Sanderson. He resides in Seattle, the original hub of the podcast, and in fact lived for a time above the Uwajimaya in the very room where the early episodes were recorded.";
const PAULY_BIO = "Pauly is the friendly likeable one of the lot, a charming man from New England who loves music, plays music, and is picking up DJing. He likes many kinds of games in no particular pattern that I can discern, but suffice it to say he has great taste. He lives in Syracuse, NY.";

function CharacterModal(props: any) {
  return (
    <Modal
      width="300"
      height="auto"
      icon={props.icon}
      title={props.title}
      defaultPosition={{x: props.posish[0], y: props.posish[1]}}
      closeModal={props.clickFunc}
      // buttons={[{
      //   value: 'Ok',
      //   onClick: props.clickFunc
      // }]}
      menu={[{
        name: 'Menu',
        list: <List>
          <List.Item onClick={props.toggleFunc}>Toggle Mode</List.Item>
        </List>
      }]}
    >{props.bio}</Modal>
  );
}

// Props: open (state), open, funcs for each person's dialog
function EPStartMenu(props: any) {
  return (
    <TaskBar list={<List>
      <List.Item
        icon={<img src={nateImg} width={32} />}
        onClick={props.nateModal} >
        {NATE_TITLE}
      </List.Item>
      <List.Item
        icon={<img src={craigImg} width={32} />}
        onClick={props.craigModal} >
        {CRAIG_TITLE}
      </List.Item>
      <List.Item
        icon={<img src={willImg} width={32} />}
        onClick={props.willModal} >
        {WILL_TITLE}
      </List.Item>
      <List.Item
        icon={<img src={paulyImg} width={32} />}
        onClick={props.paulyModal} >
        {PAULY_TITLE}
      </List.Item>
    </List>} />
  );
}

const App = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [episodeText, setEpisodeText] = useState<string>('Episode info will appear here - pick an episode!');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [insightsEnabled, setInsightsEnabled] = useState<boolean>(false);
  const [feedRssRaw, setFeedRssRaw] = useState<string>('');

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
              <Fieldset legend="Episode browser">
                <Dropdown
                  options={titles}
                  defaultValue={selectedEpisodeTitle}
                  onChange={e => getEpisodeSeasonString(e.currentTarget.value) } />
                <div className="toggle-options" style={{margin: '12px 0 -12px 0'}}>
                  <div style={{width: '22%'}}>
                    <RadioButton
                      value={'d'}
                      className='row-two'
                      checked={selectedRadio === 'd'}
                      onChange={() => setSelectedRadio('d')}>
                      Description
                    </RadioButton>
                  </div>
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
            width="500"
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
      </div>
      <div className="image-container">
        <img src={logoImg} alt="podcast logo" />
      </div>
    </ThemeProvider>
  );
};

export default App;