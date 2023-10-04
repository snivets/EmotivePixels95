import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { StyleSheetManager } from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StyleSheetManager shouldForwardProp={isPropValid}>
    <App />
  </StyleSheetManager>,
)
