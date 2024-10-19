import React from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import App from './App'

// If loading a variable font, you don't need to specify the font weight

ReactDOM.render(
  <React.StrictMode>
    <head>
      <meta charset="utf-8" />
      <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta
        name="description"
        content="Keeper's Challenge - The First Interaction"
      />
      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
      
      <meta property="og:title" content="Keeper's Challenge" />
      <meta property="og:description" content="Embark on the Keeper's Challenge - The First Interaction" />
      <meta property="og:image" content="https://keepers-challenge.charisma.rocks/images/og.png" />
      <meta property="og:url" content="https://keepers-challenge.charisma.rocks" />
      <meta property="og:type" content="website" />
      
      <title>Keeper's Challenge</title>
    </head>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
