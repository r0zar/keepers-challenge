const state = {
  top: 0,
  pages: 0,
  threshold: 4,
  mouse: [0, 0],
  content: [
    {
      tag: '00',
      text: `The Keeper's\nChallenge\nBegins`,
      images: ['/images/gem1.png'],
    },
    { tag: '01', text: `Petitions and\nChallenges`, images: ['/images/gem2.png'] },
    { tag: '02', text: `The Great\nHeist`, images: ['/images/gem3.png'] },
  ],
  depthbox: [
    {
      depth: 0,
      color: '#cccccc',
      textColor: '#ffffff',
      text: 'In the realm of Charisma,\nwhere energy flows\nand choices echo,\nthe Keeper watches,\nwaiting for the worthy.',
      image: '/images/journey-of-discovery.png',
    },
    {
      depth: -5,
      textColor: '#272727',
      text: 'Will you petition\nfor small gains,\nchallenge for greater rewards,\nor risk it all\nin a daring heist?',
      image: '/images/treasure-chest.png',
    },
  ],
  lines: [
    {
      points: [
        [-20, 0, 0],
        [-9, 0, 0],
      ],
      color: 'black',
      lineWidth: 0.5,
    },
    {
      points: [
        [20, 0, 0],
        [9, 0, 0],
      ],
      color: 'black',
      lineWidth: 0.5,
    },
  ],
}

export default state
