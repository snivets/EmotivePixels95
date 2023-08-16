import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { Button, MenuList, MenuListItem, Separator, styleReset } from 'react95';
// pick a theme of your choice
import original from 'react95/dist/themes/original';
// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

const EP_FEED_URL = 'https://anchor.fm/s/4cba81a4/podcast/rss';

function fetchEpRss() {
  let emptyData: any;
  const [podcastFeedData, setPodcastFeedData] = useState(emptyData);
  useEffect(() => {
    fetch(EP_FEED_URL)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(data => setPodcastFeedData(data));

    //data.querySelectorAll("item") etc.
    console.log(podcastFeedData);
  })
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
  const [state, doFetch] = useAsyncFn(async () => {
    const response = await fetch(EP_FEED_URL);
    const result = await response.text();
    return result
  }, []);

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <Button onClick={doFetch}>{state.value}</Button>
        {/* <MenuList>
          <MenuListItem>🎤 Sing</MenuListItem>
          <MenuListItem>💃🏻 Dance</MenuListItem>
          <Separator />
          <MenuListItem disabled>😴 Sleep</MenuListItem>
        </MenuList> */}
      </ThemeProvider>
    </div>
  );
};

export default App;