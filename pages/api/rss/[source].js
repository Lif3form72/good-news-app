export default async function handler(req, res) {
  const { source } = req.query;
  
  const rssUrls = {
    'good-news-network': 'https://www.goodnewsnetwork.org/feed/',
    'nasa-news': 'https://www.nasa.gov/news/releases/latest/rss/',
    'bbc-science': 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
  };
  
  try {
    const rssUrl = rssUrls[source];
    if (!rssUrl) {
      return res.status(404).json({ error: 'RSS source not found' });
    }
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xmlText);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
}