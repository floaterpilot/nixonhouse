export const previewCards = [
  {
    title: 'Weather',
    kicker: 'Forecasts',
    body: 'Quick local conditions and a practical look at what the day is doing.'
  },
  {
    title: 'Cubs',
    kicker: 'Baseball',
    body: 'Fast links to schedules, scores, standings, and game-day context.'
  },
  {
    title: 'News',
    kicker: 'Headlines',
    body: 'A compact launch point for local, national, and tech news sources.'
  },
  {
    title: 'Homelab',
    kicker: 'Services',
    body: 'Media, torrents, paperless documents, monitoring, and house systems in one place.'
  }
];

export const dashboardSections = [
  {
    title: 'Media',
    description: 'Watch, listen, request, organize, and check the library pipeline.',
    links: [
      { label: 'Plex', href: '#', note: 'Streaming' },
      { label: 'Jellyfin', href: '#', note: 'Backup player' },
      { label: 'Spotify', href: '#spotify', note: 'Personal audio' },
      { label: 'Overseerr', href: '#', note: 'Requests' },
      { label: 'Radarr', href: '#', note: 'Movies' },
      { label: 'Sonarr', href: '#', note: 'TV' }
    ]
  },
  {
    title: 'House',
    description: 'Home automation, documents, network, and infrastructure.',
    links: [
      { label: 'Home Assistant', href: '#', note: 'Controls' },
      { label: 'Paperless', href: '#', note: 'Documents' },
      { label: 'Proxmox', href: '#', note: 'Hosts' },
      { label: 'UniFi', href: '#', note: 'Network' },
      { label: 'Grafana', href: '#', note: 'Monitoring' }
    ]
  }
];

export const cubsLinks = [
  { label: 'Schedule', href: 'https://www.mlb.com/cubs/schedule' },
  { label: 'Scores', href: 'https://www.mlb.com/cubs/scores' },
  { label: 'Standings', href: 'https://www.mlb.com/standings' },
  { label: 'News', href: 'https://www.mlb.com/cubs/news' }
];

export const newsLinks = [
  { label: 'Reddit', href: 'https://www.reddit.com/' },
  { label: '9to5Mac', href: 'https://9to5mac.com/' },
  { label: 'Energy Central', href: 'https://energycentral.com/' },
  { label: 'Techmeme', href: 'https://www.techmeme.com/' }
];
