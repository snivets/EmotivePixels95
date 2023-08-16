import { useAsyncFn } from 'react-use';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { Button, Separator, styleReset } from 'react95';
// pick a theme of your choice
import original from 'react95/dist/themes/original';
// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';
import { useState } from 'react';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';

function getTitles(feedRss: string) {
  return new window.DOMParser().parseFromString(feedRss, 'text/xml').querySelectorAll("title");
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
  body {
    font-family: 'ms_sans_serif';
  }
`;

const App = () => {
  const [titles, setTitles] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(EP_FEED_URL);
      const result = await response.text();
      const titleElements = getTitles(result);

      const titleArray = Array.from(titleElements).map((titleElement) => {
        return titleElement.textContent || '';
      });

      setTitles(titleArray);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <Button onClick={fetchData}>Get data</Button>
        <textarea rows={10} cols={50} value={titles.join('\n')} readOnly />
      </ThemeProvider>
    </div>
  );
};

export default App;