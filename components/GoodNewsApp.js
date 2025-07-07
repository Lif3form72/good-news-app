import React, { useState, useEffect } from 'react';
import { Sun, Heart, Globe, Users, Sparkles, TrendingUp, BookOpen, Briefcase, Trophy, RefreshCw, Settings } from 'lucide-react';

const GoodNewsApp = () => {
  const [filterValue, setFilterValue] = useState(50);
  const [filteredNews, setFilteredNews] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({
    'Technology': true,
    'Health & Medicine': true,
    'Environment': true,
    'Politics & Society': true,
    'Science': true,
    'Education': true,
    'Economy': true,
    'Sports & Culture': true
  });
  const [isLocal, setIsLocal] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'category'
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [allNews, setAllNews] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(false);

  const ARTICLES_PER_PAGE = 8;
  const MAX_STORED_ARTICLES = 200;

  // RSS Feed Sources Configuration - Expanded
  const rssSources = {
    'good-news-network': {
      name: 'Good News Network',
      url: 'https://www.goodnewsnetwork.org/feed/',
      enabled: true,
      categories: ['Health & Medicine', 'Environment', 'Sports & Culture'],
      isLocal: false
    },
    'nasa-news': {
      name: 'NASA News',
      url: 'https://www.nasa.gov/news/releases/latest/rss/',
      enabled: true,
      categories: ['Science', 'Technology'],
      isLocal: false
    },
    'bbc-science': {
      name: 'BBC Science',
      url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
      enabled: true,
      categories: ['Science', 'Environment'],
      isLocal: false
    },
    'positive-news': {
      name: 'Positive News',
      url: 'https://www.positive.news/feed/',
      enabled: true,
      categories: ['Environment', 'Politics & Society', 'Health & Medicine'],
      isLocal: false
    },
    'futurity': {
      name: 'Futurity Research News',
      url: 'https://www.futurity.org/feed/',
      enabled: true,
      categories: ['Science', 'Technology', 'Health & Medicine'],
      isLocal: false
    },
    'sciencedaily': {
      name: 'ScienceDaily',
      url: 'https://www.sciencedaily.com/rss/all.xml',
      enabled: true,
      categories: ['Science', 'Health & Medicine', 'Technology'],
      isLocal: false
    },
    'reuters-science': {
      name: 'Reuters Science',
      url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/rss',
      enabled: true,
      categories: ['Science', 'Health & Medicine'],
      isLocal: false
    },
    'mit-news': {
      name: 'MIT News',
      url: 'https://news.mit.edu/rss/feed',
      enabled: true,
      categories: ['Technology', 'Science', 'Education'],
      isLocal: false
    }
  };

  // Category styling configuration
  const categoryStyles = {
    'Technology': { icon: <Sparkles className="w-5 h-5" />, color: "bg-indigo-100 text-indigo-800" },
    'Health & Medicine': { icon: <Heart className="w-5 h-5" />, color: "bg-pink-100 text-pink-800" },
    'Environment': { icon: <Sun className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-800" },
    'Politics & Society': { icon: <Users className="w-5 h-5" />, color: "bg-purple-100 text-purple-800" },
    'Science': { icon: <Globe className="w-5 h-5" />, color: "bg-cyan-100 text-cyan-800" },
    'Education': { icon: <BookOpen className="w-5 h-5" />, color: "bg-blue-100 text-blue-800" },
    'Economy': { icon: <TrendingUp className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-800" },
    'Sports & Culture': { icon: <Trophy className="w-5 h-5" />, color: "bg-orange-100 text-orange-800" }
  };

  // Modular Sentiment Analysis System
  const SentimentAnalyzer = {
    // Method 1: Keyword-based analysis (current implementation)
    keywordAnalysis: (title, summary) => {
      const positiveKeywords = [
        // Achievement & Success
        'breakthrough', 'success', 'successful', 'achievement', 'accomplish', 'victory', 'triumph', 'win', 'winning', 'won',
        'excel', 'outstanding', 'remarkable', 'exceptional', 'milestone', 'record-breaking', 'historic',
        
        // Innovation & Discovery
        'discovery', 'discover', 'innovation', 'innovative', 'invention', 'breakthrough', 'advance', 'advancement',
        'progress', 'development', 'cutting-edge', 'revolutionary', 'groundbreaking', 'pioneering', 'new',
        
        // Health & Healing
        'cure', 'heal', 'healing', 'recovery', 'recover', 'treatment', 'therapy', 'medicine', 'healthy',
        'life-saving', 'prevent', 'prevention', 'immune', 'vaccine', 'breakthrough', 'survival',
        
        // Help & Support
        'help', 'helps', 'helping', 'support', 'assist', 'aid', 'rescue', 'save', 'saves', 'saving',
        'donate', 'donation', 'charity', 'volunteer', 'community', 'together', 'unite', 'cooperation',
        
        // Improvement & Growth
        'improve', 'improvement', 'better', 'enhance', 'upgrade', 'boost', 'increase', 'grow', 'growth',
        'rise', 'rising', 'expand', 'expansion', 'strengthen', 'optimize', 'efficient', 'effective',
        
        // Positive Emotions
        'hope', 'hopeful', 'optimistic', 'joy', 'happy', 'celebrate', 'celebration', 'proud', 'pride',
        'inspire', 'inspiring', 'motivation', 'encouraging', 'uplifting', 'positive', 'amazing',
        
        // Environmental & Sustainability
        'clean', 'green', 'sustainable', 'renewable', 'eco-friendly', 'conservation', 'restore',
        'preserve', 'protect', 'environmental', 'climate-friendly', 'carbon-neutral', 'organic',
        
        // Education & Knowledge
        'learn', 'education', 'teach', 'knowledge', 'wisdom', 'skill', 'training', 'scholarship',
        'graduation', 'degree', 'literacy', 'research', 'study', 'science', 'understanding',
        
        // Peace & Safety
        'peace', 'peaceful', 'safe', 'safety', 'secure', 'stability', 'harmony', 'agreement',
        'cooperation', 'collaboration', 'unity', 'reconciliation', 'resolution', 'solution',
        
        // Economic Positives
        'prosperity', 'wealth', 'profit', 'gain', 'benefit', 'employment', 'job', 'opportunity',
        'investment', 'funding', 'grant', 'bonus', 'reward', 'economic growth', 'recovery'
      ];

      const negativeKeywords = [
        // Disaster & Tragedy
        'disaster', 'tragedy', 'catastrophe', 'crisis', 'emergency', 'calamity', 'devastation',
        'destruction', 'collapse', 'crash', 'accident', 'explosion', 'fire', 'flood', 'earthquake',
        
        // Violence & Conflict
        'war', 'violence', 'conflict', 'fight', 'attack', 'assault', 'terrorism', 'bomb', 'shooting',
        'murder', 'kill', 'death', 'died', 'fatal', 'deadly', 'weapon', 'threat', 'invasion',
        
        // Crime & Legal Issues
        'crime', 'criminal', 'theft', 'robbery', 'fraud', 'corruption', 'scandal', 'illegal',
        'arrest', 'prison', 'guilty', 'convicted', 'lawsuit', 'court', 'investigation', 'police',
        
        // Health Problems
        'disease', 'illness', 'sick', 'pandemic', 'epidemic', 'virus', 'infection', 'cancer',
        'outbreak', 'contamination', 'toxic', 'poison', 'injury', 'wounded', 'hospital', 'emergency',
        
        // Economic Problems
        'recession', 'depression', 'unemployment', 'layoffs', 'bankruptcy', 'debt', 'deficit',
        'inflation', 'poverty', 'homeless', 'foreclosure', 'downturn', 'decline', 'loss', 'cut',
        
        // Failure & Problems
        'fail', 'failure', 'problem', 'issue', 'concern', 'worry', 'risk', 'danger', 'threat',
        'challenge', 'difficulty', 'struggle', 'setback', 'delay', 'cancel', 'postpone', 'reject',
        
        // Environmental Problems
        'pollution', 'toxic', 'contamination', 'climate change', 'global warming', 'extinction',
        'deforestation', 'drought', 'famine', 'waste', 'damage', 'harmful', 'dangerous',
        
        // Social Issues
        'discrimination', 'racism', 'inequality', 'injustice', 'protest', 'riot', 'strike',
        'controversy', 'argument', 'dispute', 'tension', 'division', 'conflict', 'opposition',
        
        // Negative Emotions
        'fear', 'anxiety', 'stress', 'depression', 'anger', 'hate', 'sad', 'grief', 'despair',
        'frustration', 'disappointment', 'shock', 'horror', 'panic', 'worried', 'concerned'
      ];

      const neutralKeywords = [
        'report', 'according', 'study', 'research', 'analysis', 'data', 'statistics', 'survey',
        'meeting', 'conference', 'announcement', 'statement', 'decision', 'plan', 'policy'
      ];

      const text = (title + ' ' + summary).toLowerCase();
      let score = 50; // Neutral baseline
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;

      // Count positive keywords
      positiveKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          positiveCount += matches.length;
          score += matches.length * 8; // Each positive keyword adds 8 points
        }
      });

      // Count negative keywords  
      negativeKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          negativeCount += matches.length;
          score -= matches.length * 12; // Each negative keyword removes 12 points
        }
      });

      // Count neutral keywords
      neutralKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          neutralCount += matches.length;
        }
      });

      // Boost score for title keywords (titles are more important)
      const titleText = title.toLowerCase();
      positiveKeywords.forEach(keyword => {
        if (titleText.includes(keyword)) {
          score += 5; // Extra boost for positive words in title
        }
      });

      negativeKeywords.forEach(keyword => {
        if (titleText.includes(keyword)) {
          score -= 8; // Extra penalty for negative words in title
        }
      });

      // Ensure score stays within 0-100 range
      score = Math.max(0, Math.min(100, Math.round(score)));

      console.log(`Sentiment Analysis: "${title.substring(0, 50)}..." → Score: ${score} (P:${positiveCount}, N:${negativeCount}, NEU:${neutralCount})`);
      
      return score;
    },

    // Method 2: External API (MeaningCloud) - ready to implement
    meaningCloudAnalysis: async (title, summary) => {
      try {
        const response = await fetch('/api/analyze-sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, summary })
        });
        
        const result = await response.json();
        return result.positivityScore;
      } catch (error) {
        console.error('MeaningCloud API failed, falling back to keyword analysis:', error);
        return SentimentAnalyzer.keywordAnalysis(title, summary);
      }
    },

    // Method 3: Claude AI Analysis - ready to implement
    claudeAnalysis: async (title, summary) => {
      try {
        const prompt = `
        Rate this news article's positivity on a scale of 0-100:
        - 0-20: Very negative (disasters, conflicts, tragedies, serious problems)
        - 21-40: Negative (setbacks, concerns, challenging issues)
        - 41-60: Neutral (factual reporting, mixed outcomes, routine news)
        - 61-80: Positive (progress, achievements, helpful developments)
        - 81-100: Very positive (breakthroughs, inspiring stories, major victories)

        Consider both the content and tone. Focus on the impact on society and human wellbeing.

        Title: ${title}
        Summary: ${summary}

        Respond with only the number (0-100).
        `;

        const response = await window.claude.complete(prompt);
        const score = parseInt(response.trim());
        
        if (isNaN(score) || score < 0 || score > 100) {
          throw new Error('Invalid score returned');
        }
        
        console.log(`Claude Analysis: "${title.substring(0, 50)}..." → Score: ${score}`);
        return score;
      } catch (error) {
        console.error('Claude API failed, falling back to keyword analysis:', error);
        return SentimentAnalyzer.keywordAnalysis(title, summary);
      }
    },

    // Current active method - easy to swap out
    analyze: (title, summary) => {
      // Switch between methods here:
      return SentimentAnalyzer.keywordAnalysis(title, summary);
      // return SentimentAnalyzer.meaningCloudAnalysis(title, summary);  // Uncomment for MeaningCloud
      // return SentimentAnalyzer.claudeAnalysis(title, summary);        // Uncomment for Claude AI
    }
  };

  // Utility functions for article management
  const createStableId = (title, link, pubDate, sourceId) => {
    if (link) {
      return btoa(link).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    }
    
    const content = `${title}-${pubDate}-${sourceId}`;
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  };

  const saveArticlesToStorage = (articles) => {
    try {
      const dataToSave = {
        articles: articles.slice(0, MAX_STORED_ARTICLES),
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('goodNewsArticles', JSON.stringify(dataToSave));
      console.log(`Saved ${articles.length} articles to storage`);
    } catch (error) {
      console.error('Failed to save articles to storage:', error);
    }
  };

  const loadArticlesFromStorage = () => {
    try {
      const saved = localStorage.getItem('goodNewsArticles');
      if (saved) {
        const { articles, lastUpdated, version } = JSON.parse(saved);
        
        const daysSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpdate < 7 && version === '1.0') {
          console.log(`Loaded ${articles.length} articles from storage (${daysSinceUpdate.toFixed(1)} days old)`);
          return articles;
        } else {
          console.log('Stored articles are too old, clearing storage');
          localStorage.removeItem('goodNewsArticles');
        }
      }
    } catch (error) {
      console.error('Failed to load articles from storage:', error);
    }
    return [];
  };

  const mergeNewArticles = (existingArticles, newArticles) => {
    console.log(`Merging ${newArticles.length} new articles with ${existingArticles.length} existing articles`);
    
    const existingIds = new Set(existingArticles.map(a => a.id));
    
    const trulyNewArticles = newArticles.filter(article => {
      const isNew = !existingIds.has(article.id);
      if (!isNew) {
        console.log(`Skipping duplicate article: ${article.title}`);
      }
      return isNew;
    });
    
    console.log(`Found ${trulyNewArticles.length} truly new articles`);
    
    const combinedArticles = [...trulyNewArticles, ...existingArticles]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, MAX_STORED_ARTICLES);
    
    console.log(`Final article count: ${combinedArticles.length}`);
    return combinedArticles;
  };

  const paginateArticles = (articles, page) => {
    const startIndex = 0;
    const endIndex = page * ARTICLES_PER_PAGE;
    return articles.slice(startIndex, endIndex);
  };

  const fetchRSSFeed = async (sourceId, source) => {
    console.log(`🔄 Attempting real RSS fetch from ${source.name}...`);
    
    try {
      // Strategy 1: Try AllOrigins proxy
      try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
        console.log(`📡 Trying AllOrigins proxy for ${source.name}...`);
        
        const response = await fetch(allOriginsUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.contents) {
            console.log(`✅ RSS SUCCESS: Real content from ${source.name}! XML length: ${data.contents.length}`);
            return parseXMLToArticles(data.contents, sourceId, source);
          }
        }
        
        throw new Error('AllOrigins returned empty or failed');
        
      } catch (allOriginsError) {
        console.log(`❌ AllOrigins blocked for ${source.name}`);
        
        // Strategy 2: Try CORS.sh proxy
        try {
          const corsShUrl = `https://cors.sh/${source.url}`;
          console.log(`📡 Trying CORS.sh proxy for ${source.name}...`);
          
          const response = await fetch(corsShUrl, {
            headers: { 'x-requested-with': 'XMLHttpRequest' }
          });
          
          if (response.ok) {
            const xmlContent = await response.text();
            console.log(`✅ RSS SUCCESS: Real content from ${source.name}! XML length: ${xmlContent.length}`);
            return parseXMLToArticles(xmlContent, sourceId, source);
          }
          
          throw new Error('CORS.sh failed');
          
        } catch (corsShError) {
          console.log(`❌ CORS.sh blocked for ${source.name}`);
          
          // Strategy 3: Try RSS2JSON API
          try {
            const rss2JsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
            console.log(`📡 Trying RSS2JSON API for ${source.name}...`);
            
            const response = await fetch(rss2JsonUrl);
            
            if (response.ok) {
              const jsonData = await response.json();
              
              if (jsonData.status === 'ok' && jsonData.items) {
                console.log(`✅ RSS SUCCESS: Real content from ${source.name}! ${jsonData.items.length} items`);
                return parseJSONToArticles(jsonData.items, sourceId, source);
              }
            }
            
            throw new Error('RSS2JSON failed');
            
          } catch (rss2JsonError) {
            console.log(`❌ RSS2JSON blocked for ${source.name}`);
            console.log(`❌ All RSS strategies failed for ${source.name} - no articles available`);
            return [];
          }
        }
      }
      
    } catch (error) {
      console.error(`Complete failure fetching ${source.name}:`, error);
      return [];
    }
  };

  const parseXMLToArticles = (xmlContent, sourceId, source) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing failed');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      console.log(`Found ${items.length} XML items from ${source.name}`);
      
      if (items.length === 0) {
        throw new Error('No items found in RSS feed');
      }
      
      const articles = Array.from(items).slice(0, 8).map((item, index) => {
        const title = item.querySelector('title')?.textContent?.trim() || 'No title';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const guid = item.querySelector('guid')?.textContent || '';
        
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim().substring(0, 250);
        
        let thumbnail = null;
        
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch && imgMatch[1]) {
          thumbnail = imgMatch[1];
        }
        
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
          thumbnail = enclosure.getAttribute('url');
        }
        
        const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
        if (mediaThumbnail) {
          thumbnail = mediaThumbnail.getAttribute('url') || mediaThumbnail.textContent;
        }
        
        if (!thumbnail) {
          const fallbackImages = {
            'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
            'Health & Medicine': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
            'Environment': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop',
            'Politics & Society': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop',
            'Science': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=200&fit=crop',
            'Education': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
            'Economy': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
            'Sports & Culture': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop'
          };
          thumbnail = fallbackImages[source.categories[index % source.categories.length]];
        }

        const stableId = createStableId(title, link || guid, pubDate, sourceId);

        return {
          id: stableId,
          title: title.substring(0, 150),
          summary: cleanDescription + (cleanDescription.length >= 250 ? '...' : ''),
          source: source.name,
          category: source.categories[index % source.categories.length],
          positivityScore: SentimentAnalyzer.analyze(title, cleanDescription),
          isLocal: source.isLocal,
          timestamp: new Date(pubDate).toISOString(),
          thumbnail: thumbnail,
          url: link || '#',
          needsAnalysis: false
        };
      });
      
      console.log(`✅ Successfully parsed ${articles.length} real articles from ${source.name}`);
      return articles;
      
    } catch (error) {
      console.error(`XML parsing error for ${source.name}:`, error);
      throw error;
    }
  };

  const parseJSONToArticles = (items, sourceId, source) => {
    try {
      console.log(`Parsing ${items.length} JSON items from ${source.name}`);
      
      const articles = items.slice(0, 8).map((item, index) => {
        const title = item.title?.trim() || 'No title';
        const description = item.description || item.content || '';
        const link = item.link || item.url || '';
        const pubDate = item.pubDate || item.published || new Date().toISOString();
        
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim().substring(0, 250);
        
        const stableId = createStableId(title, link, pubDate, sourceId);
        
        return {
          id: stableId,
          title: title.substring(0, 150),
          summary: cleanDescription + (cleanDescription.length >= 250 ? '...' : ''),
          source: source.name,
          category: source.categories[index % source.categories.length],
          positivityScore: SentimentAnalyzer.analyze(title, cleanDescription),
          isLocal: source.isLocal,
          timestamp: new Date(pubDate).toISOString(),
          thumbnail: item.thumbnail || `https://images.unsplash.com/photo-150471143496${(index % 10) + 1}-e33886168f5c?w=400&h=200&fit=crop`,
          url: link || '#',
          needsAnalysis: false
        };
      });
      
      console.log(`✅ Successfully parsed ${articles.length} real JSON articles from ${source.name}`);
      return articles;
      
    } catch (error) {
      console.error(`JSON parsing error for ${source.name}:`, error);
      throw error;
    }
  };

  const fetchAllNews = async () => {
    console.log('=== STARTING PROFESSIONAL RSS FETCH ===');
    setIsLoadingNews(true);
    
    try {
      const enabledSources = Object.entries(rssSources).filter(([_, source]) => source.enabled);
      console.log(`Fetching from ${enabledSources.length} enabled sources:`, enabledSources.map(([id, s]) => s.name));
      
      const allFetchPromises = enabledSources.map(([sourceId, source]) => fetchRSSFeed(sourceId, source));
      const allFetchedNews = await Promise.all(allFetchPromises);
      const newArticles = allFetchedNews.flat();
      
      console.log(`Fetched ${newArticles.length} new articles`);
      
      if (newArticles.length > 0) {
        const existingArticles = allNews;
        const mergedArticles = mergeNewArticles(existingArticles, newArticles);
        
        setAllNews(mergedArticles);
        saveArticlesToStorage(mergedArticles);
        setLastUpdated(new Date());
        
        console.log(`Updated article database with ${mergedArticles.length} total articles`);
      } else {
        console.log('No new articles fetched');
      }
      
    } catch (error) {
      console.error('Error in fetchAllNews:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const loadMoreArticles = () => {
    const nextPage = currentPage + 1;
    const newDisplayedArticles = paginateArticles(filteredNews, nextPage);
    
    setDisplayedArticles(newDisplayedArticles);
    setCurrentPage(nextPage);
    setHasMoreArticles(newDisplayedArticles.length < filteredNews.length);
    
    console.log(`Loaded page ${nextPage}, showing ${newDisplayedArticles.length} of ${filteredNews.length} articles`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.abs(now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    const diffInWeeks = diffInDays / 7;
    const diffInMonths = diffInDays / 30;
    
    let relativeTime;
    
    if (diffInMinutes < 60) {
      relativeTime = diffInMinutes < 1 ? "Just now" : `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      relativeTime = `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      relativeTime = diffInDays < 2 ? "Yesterday" : `${Math.floor(diffInDays)}d ago`;
    } else if (diffInWeeks < 4) {
      relativeTime = `${Math.floor(diffInWeeks)}w ago`;
    } else {
      relativeTime = `${Math.floor(diffInMonths)}mo ago`;
    }
    
    return relativeTime;
  };

  const formatFullTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const articleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (articleDate.getTime() === today.getTime()) {
      return timeString;
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${dateString} ${timeString}`;
    }
    
    const dateString = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateString} ${timeString}`;
  };

  const sortArticles = (articles) => {
    if (sortBy === 'date') {
      return [...articles].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'category') {
      return [...articles].sort((a, b) => {
        if (a.category === b.category) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return a.category.localeCompare(b.category);
      });
    }
    return articles;
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    const filterAndPaginateNews = () => {
      // FIXED: Correct slider logic - lower values = more restrictive (higher positivity threshold)
      let threshold;
      if (filterValue <= 20) threshold = 80; // Only very positive news (80-100)
      else if (filterValue <= 40) threshold = 70; // Mostly positive news (70-100)
      else if (filterValue <= 60) threshold = 50; // Balanced news (50-100)
      else if (filterValue <= 80) threshold = 30; // Include some negative (30-100)
      else threshold = 0; // Show everything (0-100)

      console.log(`Filter slider: ${filterValue} → Positivity threshold: ${threshold}+`);

      const filtered = allNews.filter(article => {
        const meetsPositivityThreshold = article.positivityScore >= threshold;
        const matchesCategories = selectedCategories[article.category];
        const matchesLocation = isLocal ? article.isLocal : true;
        
        const includeArticle = meetsPositivityThreshold && matchesCategories && matchesLocation;
        
        // Debug logging for first few articles
        if (filtered.length < 3) {
          console.log(`Article "${article.title.substring(0, 30)}..." score:${article.positivityScore} threshold:${threshold} → ${includeArticle ? 'INCLUDED' : 'FILTERED OUT'}`);
        }
        
        return includeArticle;
      });
      
      const sorted = sortArticles(filtered);
      setFilteredNews(sorted);
      
      const initialPage = 1;
      const initialDisplayed = paginateArticles(sorted, initialPage);
      setDisplayedArticles(initialDisplayed);
      setCurrentPage(initialPage);
      setHasMoreArticles(initialDisplayed.length < sorted.length);
      
      console.log(`Filter results: ${sorted.length} articles pass filter (showing first ${initialDisplayed.length})`);
    };

    filterAndPaginateNews();
  }, [filterValue, selectedCategories, isLocal, sortBy, allNews]);

  useEffect(() => {
    console.log('=== INITIALIZING GOOD NEWS APP ===');
    
    const storedArticles = loadArticlesFromStorage();
    if (storedArticles.length > 0) {
      console.log(`Loaded ${storedArticles.length} articles from storage`);
      setAllNews(storedArticles);
      
      const newestArticle = storedArticles[0];
      if (newestArticle) {
        setLastUpdated(new Date(newestArticle.timestamp));
      }
    }
    
    setTimeout(() => {
      console.log('Auto-fetching fresh RSS news...');
      fetchAllNews();
    }, 1000);
  }, []);

  const getFilterLabel = (value) => {
    if (value <= 20) return "Only Good News";
    if (value <= 40) return "Mostly Positive";
    if (value <= 60) return "Balanced";
    if (value <= 80) return "Include Some Negative";
    return "Unfiltered";
  };

  const getFilterColor = (value) => {
    if (value <= 20) return "text-green-600";
    if (value <= 40) return "text-blue-600";
    if (value <= 60) return "text-yellow-600";
    if (value <= 80) return "text-orange-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good News</h1>
                <p className="text-sm text-gray-600">Curate your news experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAllNews}
                disabled={isLoadingNews}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingNews ? 'animate-spin' : ''}`} />
                <span>{isLoadingNews ? 'Loading...' : 'Refresh News'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                <Settings className="w-4 h-4" />
                <span>Sources</span>
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Showing {displayedArticles.length} of {filteredNews.length} stories
                {allNews.length > 0 && (
                  <span className="text-gray-400"> • {allNews.length} total in database</span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                Updated {formatTimestamp(lastUpdated.toISOString())} • Sorted by{' '}
                <button 
                  onClick={() => setSortBy('date')}
                  className={`hover:text-blue-600 ${sortBy === 'date' ? 'underline text-blue-600' : ''}`}
                >
                  Date
                </button>
                {' | '}
                <button 
                  onClick={() => setSortBy('category')}
                  className={`hover:text-blue-600 ${sortBy === 'category' ? 'underline text-blue-600' : ''}`}
                >
                  Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">News Filter</h2>
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Only Good News</span>
              <span className="text-sm text-gray-600">Unfiltered</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={filterValue}
              onChange={(e) => setFilterValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #3b82f6 50%, #ef4444 100%)`
              }}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getFilterColor(filterValue)}`}>
                  {getFilterLabel(filterValue)}
                </div>
                <div className="text-sm text-gray-500">
                  Threshold: {filterValue <= 20 ? '80+' : filterValue <= 40 ? '60+' : filterValue <= 60 ? '40+' : filterValue <= 80 ? '20+' : '0+'} positivity score
                </div>
              </div>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">News Categories</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">World</span>
                <button
                  onClick={() => setIsLocal(!isLocal)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isLocal ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isLocal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Local</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(selectedCategories).map(([category, isSelected]) => {
                const style = categoryStyles[category];
                return (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.color}`}>
                      {style.icon}
                      <span className="ml-1">{category}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayedArticles.map((article) => {
            const style = categoryStyles[article.category];
            return (
              <div key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col">
                  {article.thumbnail && (
                    <div className="w-full h-48 flex-shrink-0 bg-gray-100">
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          e.target.parentElement.style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.color}`}>
                        {style.icon}
                        <span className="ml-1">{article.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">{article.positivityScore}</span>
                        {article.isLocal && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Local</span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-3 leading-tight">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="font-medium">{article.source}</span>
                        <span>•</span>
                        <span>{formatFullTimestamp(article.timestamp)}</span>
                        <span className="text-gray-400">({formatTimestamp(article.timestamp)})</span>
                      </div>
                      <button 
                        onClick={() => article.url && window.open(article.url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        <span>Read More</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMoreArticles && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreArticles}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Load More Articles ({filteredNews.length - displayedArticles.length} remaining)
            </button>
          </div>
        )}

        {displayedArticles.length === 0 && !isLoadingNews && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories match your filter</h3>
            <p className="text-gray-600">Try adjusting your filter settings to see more content.</p>
            {allNews.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Database contains {allNews.length} articles total
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Good News App • Promoting positive mental health through curated news</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodNewsApp;
